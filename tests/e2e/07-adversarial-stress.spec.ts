import { test, expect } from '@playwright/test';
import { prisma } from '../helpers/auth';

/**
 * Challenger M5-1: Phase 2 Adversarial Stress Testing & Edge Cases
 * 
 * Scope:
 * 1. Malformed payloads to /api/enquiries (missing email, invalid quantity, empty items, negative quantities, foreign keys)
 * 2. Route crawling robustness (non-existent product slugs, IDs, categories, use-cases returning graceful 404 without 500)
 * 3. SQLite concurrency under mixed RFQ enquiry insertions and admin reads without SQLITE_BUSY
 * 4. WhatsApp link generation with special characters, symbols, and multilingual product names
 */

test.describe('07 - Adversarial Stress Testing & Edge Cases', () => {
  let seededProduct: { id: string; name: string; slug: string } | null = null;
  const createdEnquiryIds: string[] = [];

  test.beforeAll(async () => {
    // Retrieve a valid seeded product for reference in enquiry tests
    seededProduct = await prisma.product.findFirst({
      select: { id: true, name: true, slug: true },
    });
    expect(seededProduct, 'Pre-condition: At least one seeded product must exist in database').not.toBeNull();
  });

  test.afterAll(async () => {
    // Clean up any enquiries created during the stress tests
    if (createdEnquiryIds.length > 0) {
      await prisma.enquiryItem.deleteMany({
        where: { enquiryId: { in: createdEnquiryIds } },
      });
      await prisma.enquiry.deleteMany({
        where: { id: { in: createdEnquiryIds } },
      });
    }
    await prisma.$disconnect();
  });

  // =========================================================================
  // SECTION 1: MALFORMED PAYLOADS TO /api/enquiries
  // =========================================================================
  test.describe('Section 1: Malformed Payloads to /api/enquiries', () => {
    test('1.1 Rejects payload missing email with HTTP 400 Bad Request', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Adversarial Tester',
          phone: '+919999988888',
          items: [{ productId: seededProduct!.id, quantity: 2 }],
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email is required');
    });

    test('1.2 Rejects payload with empty/whitespace-only email with HTTP 400', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Adversarial Tester',
          email: '   ',
          items: [{ productId: seededProduct!.id, quantity: 1 }],
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email is required');
    });

    test('1.3 Rejects payload missing customer name with HTTP 400', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          email: 'tester@commercialeng-test.com',
          message: 'Quotation request without name',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Name is required');
    });

    test('1.4 Rejects payload with whitespace-only customer name with HTTP 400', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: '\t  \n  ',
          email: 'tester@commercialeng-test.com',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Name is required');
    });

    test('1.5 Handles empty items array gracefully (HTTP 201 General Consultation)', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Consultation Inquirer',
          email: 'consult@commercialeng-test.com',
          company: 'Structural Engineering Corp',
          message: 'General inquiry with no pre-selected products',
          items: [],
        },
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.enquiryId).toBeTruthy();
      createdEnquiryIds.push(data.enquiryId);

      // Verify record exists in SQLite with 0 items
      const enquiry = await prisma.enquiry.findUnique({
        where: { id: data.enquiryId },
        include: { items: true },
      });
      expect(enquiry).not.toBeNull();
      expect(enquiry!.items).toHaveLength(0);
    });

    test('1.6 Sanitizes non-numeric quantity to minimum 1 without crashing (HTTP 201)', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Bad Quantity User',
          email: 'badqty@commercialeng-test.com',
          items: [{ productId: seededProduct!.id, quantity: 'not-a-number' }],
        },
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      createdEnquiryIds.push(data.enquiryId);

      const enquiry = await prisma.enquiry.findUnique({
        where: { id: data.enquiryId },
        include: { items: true },
      });
      expect(enquiry).not.toBeNull();
      expect(enquiry!.items).toHaveLength(1);
      expect(enquiry!.items[0].quantity).toBe(1);
    });

    test('1.7 Sanitizes negative quantity to minimum 1 (HTTP 201)', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Negative Quantity User',
          email: 'negqty@commercialeng-test.com',
          items: [{ productId: seededProduct!.id, quantity: -42 }],
        },
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      createdEnquiryIds.push(data.enquiryId);

      const enquiry = await prisma.enquiry.findUnique({
        where: { id: data.enquiryId },
        include: { items: true },
      });
      expect(enquiry).not.toBeNull();
      expect(enquiry!.items[0].quantity).toBe(1);
    });

    test('1.8 Sanitizes zero quantity to minimum 1 (HTTP 201)', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Zero Quantity User',
          email: 'zeroqty@commercialeng-test.com',
          items: [{ productId: seededProduct!.id, quantity: 0 }],
        },
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      createdEnquiryIds.push(data.enquiryId);

      const enquiry = await prisma.enquiry.findUnique({
        where: { id: data.enquiryId },
        include: { items: true },
      });
      expect(enquiry!.items[0].quantity).toBe(1);
    });

    test('1.9 Handles non-array items payload gracefully (HTTP 201)', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Non Array User',
          email: 'nonarray@commercialeng-test.com',
          items: 'invalid-string-not-an-array',
        },
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      createdEnquiryIds.push(data.enquiryId);

      const enquiry = await prisma.enquiry.findUnique({
        where: { id: data.enquiryId },
        include: { items: true },
      });
      expect(enquiry).not.toBeNull();
      expect(enquiry!.items).toHaveLength(0);
    });

    test('1.10 Enforces atomic transaction rollback on invalid foreign key productId', async ({ request }) => {
      const countBefore = await prisma.enquiry.count();

      const response = await request.post('/api/enquiries', {
        data: {
          name: 'Foreign Key Failure',
          email: 'fk-fail@commercialeng-test.com',
          items: [{ productId: 'non-existent-product-id-xyz-999', quantity: 5 }],
        },
      });

      // Must fail due to SQLite foreign key constraint
      expect(response.status()).toBe(500);

      // Verify atomic transaction rollback: no orphan enquiry record created
      const countAfter = await prisma.enquiry.count();
      expect(countAfter, 'Atomic rollback failed: orphan enquiry was persisted').toBe(countBefore);
    });

    test('1.11 Handles malformed JSON syntax gracefully without server crash', async ({ request }) => {
      const response = await request.post('/api/enquiries', {
        headers: { 'Content-Type': 'application/json' },
        data: '{ invalid-json-payload-broken-syntax',
      });

      // Must return an error code and not crash server
      expect([400, 500]).toContain(response.status());
    });
  });

  // =========================================================================
  // SECTION 2: ROUTE CRAWLING ROBUSTNESS (GRACEFUL 404 WITHOUT 500)
  // =========================================================================
  test.describe('Section 2: Route Crawling Robustness (Graceful 404 Without 500)', () => {
    test('2.1 Non-existent product slug returns HTTP 404 (strictly not 500)', async ({ request }) => {
      const response = await request.get('/products/non-existent-slug-xyz');
      expect(response.status(), 'Expected HTTP 404 for missing product slug').toBe(404);
    });

    test('2.2 Non-existent cuid product ID returns HTTP 404 (strictly not 500)', async ({ request }) => {
      const response = await request.get('/products/cm0fakecuid000000000000000');
      expect(response.status(), 'Expected HTTP 404 for missing product cuid').toBe(404);
    });

    test('2.3 Non-existent category slug returns HTTP 404 (strictly not 500)', async ({ request }) => {
      const response = await request.get('/categories/non-existent-category-slug-404');
      expect(response.status(), 'Expected HTTP 404 for missing category slug').toBe(404);
    });

    test('2.4 Non-existent use-case slug returns HTTP 404 (strictly not 500)', async ({ request }) => {
      const response = await request.get('/use-cases/non-existent-use-case-slug-404');
      expect(response.status(), 'Expected HTTP 404 for missing use-case slug').toBe(404);
    });

    test('2.5 URL-encoded special character slugs return HTTP 404 (strictly not 500)', async ({ request }) => {
      const specialSlugs = [
        '/products/%20%20%20',
        '/products/slug%23with%23hashes',
        '/products/slug%26with%26ampersands',
      ];

      for (const route of specialSlugs) {
        const response = await request.get(route);
        expect(response.status(), `Route ${route} must return 404`).toBe(404);
      }
    });

    test('2.6 Browser navigation to non-existent product renders 404 response without 500 error', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto('/products/non-existent-adversarial-probe-slug', {
        waitUntil: 'domcontentloaded',
      });

      expect(response).not.toBeNull();
      expect(response!.status()).toBe(404);
      expect(response!.status()).not.toBe(500);

      const html = await response!.text();
      expect(html).toContain('Product Not Found');
      expect(html).not.toContain('Internal Server Error');

      // Filter expected 404 status log from browser
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes('404') && !e.includes('favicon.ico')
      );
      expect(criticalErrors, `Unexpected console errors: ${criticalErrors.join('; ')}`).toHaveLength(0);
    });
  });

  // =========================================================================
  // SECTION 3: SQLITE CONCURRENCY UNDER MIXED RFQ WRITES AND READS
  // =========================================================================
  test.describe('Section 3: SQLite Concurrency Under Mixed RFQ Writes & Admin Reads', () => {
    test('3.1 Executes 20 mixed concurrent operations (10 RFQ insertions + 10 reads) without SQLITE_BUSY', async ({ request }) => {
      const initialEnquiryCount = await prisma.enquiry.count();
      const operationsCount = 20;

      // Prepare 10 concurrent POST insertions and 10 concurrent mixed reads
      const tasks = Array.from({ length: operationsCount }, async (_, idx) => {
        if (idx % 2 === 0) {
          // Write operation: RFQ enquiry submission via API
          const email = `concurrency-user-${idx}-${Date.now()}@commercialeng-test.com`;
          const res = await request.post('/api/enquiries', {
            data: {
              name: `Concurrent Engineer ${idx}`,
              email,
              company: `Industrial Enterprise ${idx}`,
              message: `High concurrency stress test payload #${idx}`,
              items: [{ productId: seededProduct!.id, quantity: idx + 1 }],
            },
          });
          expect(res.status(), `Concurrent write #${idx} failed`).toBe(201);
          const data = await res.json();
          createdEnquiryIds.push(data.enquiryId);
          return { type: 'write', id: data.enquiryId, success: true };
        } else {
          // Read operation: mixed read queries against SQLite
          if (idx % 4 === 1) {
            const enquiries = await prisma.enquiry.findMany({
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: { items: true },
            });
            return { type: 'read-enquiries', count: enquiries.length, success: true };
          } else {
            const [settings, products] = await Promise.all([
              prisma.setting.findMany(),
              prisma.product.findMany({ take: 3 }),
            ]);
            return { type: 'read-metadata', settingsCount: settings.length, productsCount: products.length, success: true };
          }
        }
      });

      // Execute all 20 operations concurrently
      const results = await Promise.all(tasks);
      expect(results).toHaveLength(operationsCount);

      // Verify that all 10 write operations succeeded and incremented database count
      const finalEnquiryCount = await prisma.enquiry.count();
      expect(finalEnquiryCount).toBe(initialEnquiryCount + 10);
    });

    test('3.2 Direct Prisma high-concurrency transaction stress (15 parallel write transactions)', async () => {
      const batchIds: string[] = [];
      const parallelTxs = Array.from({ length: 15 }, async (_, i) => {
        return prisma.$transaction(async (tx) => {
          const enq = await tx.enquiry.create({
            data: {
              name: `Direct Tx Worker ${i}`,
              email: `tx-worker-${i}-${Date.now()}@commercialeng-test.com`,
              message: `Prisma direct stress test tx ${i}`,
            },
          });
          const item = await tx.enquiryItem.create({
            data: {
              enquiryId: enq.id,
              productId: seededProduct!.id,
              quantity: i + 1,
            },
          });
          return { enqId: enq.id, itemId: item.id };
        });
      });

      const txResults = await Promise.all(parallelTxs);
      expect(txResults).toHaveLength(15);

      for (const res of txResults) {
        batchIds.push(res.enqId);
        createdEnquiryIds.push(res.enqId);
      }

      // Verify all 15 transactions committed cleanly
      const persistedCount = await prisma.enquiry.count({
        where: { id: { in: batchIds } },
      });
      expect(persistedCount).toBe(15);
    });
  });

  // =========================================================================
  // SECTION 4: WHATSAPP LINK GENERATION WITH SPECIAL CHARACTERS
  // =========================================================================
  test.describe('Section 4: WhatsApp Link Generation with Special Characters', () => {
    const buildWhatsAppUrl = (productName: string, productSlug: string, whatsappNumber = '+919876543210') => {
      let cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
      if (!cleanNumber) {
        cleanNumber = '+919876543210';
      }
      const messageText = `Hello Commercial Engineering Associates, I would like to enquire about ${productName} (${productSlug || 'Catalog Item'}). Please share pricing, technical data sheet, and minimum order quantity.`;
      const encodedText = encodeURIComponent(messageText);
      return `https://wa.me/${cleanNumber}?text=${encodedText}`;
    };

    test('4.1 Correctly encodes ampersand (&) without query string parameter pollution', () => {
      const prodName = 'CEA Structural Tape & High-Tack Acrylic Sealant';
      const urlStr = buildWhatsAppUrl(prodName, 'tape-and-sealant');

      const parsedUrl = new URL(urlStr);
      expect(parsedUrl.origin).toBe('https://wa.me');
      expect(parsedUrl.pathname).toBe('/+919876543210');

      // The text parameter should NOT be split into multiple query parameters by '&'
      const searchParams = parsedUrl.searchParams;
      expect(searchParams.get('High-Tack Acrylic Sealant')).toBeNull();

      const decodedText = searchParams.get('text');
      expect(decodedText).toContain('CEA Structural Tape & High-Tack Acrylic Sealant');
    });

    test('4.2 Correctly encodes plus sign (+) preserving literal plus symbol', () => {
      const prodName = 'CEA High-Temp Silicone (+315°C / -60°C Extreme)';
      const urlStr = buildWhatsAppUrl(prodName, 'silicone-plus-temp');

      const parsedUrl = new URL(urlStr);
      const decodedText = parsedUrl.searchParams.get('text');
      expect(decodedText).toContain('+315°C');
    });

    test('4.3 Correctly encodes hash/pound (#) preventing URL fragment truncation', () => {
      const prodName = 'CEA Fast-Cure Cyanoacrylate #401/Industrial';
      const urlStr = buildWhatsAppUrl(prodName, 'cyanoacrylate-401');

      // If # is unencoded, everything after it becomes hash/fragment and is dropped from query params
      const parsedUrl = new URL(urlStr);
      expect(parsedUrl.hash).toBe(''); // Fragment must be empty!

      const decodedText = parsedUrl.searchParams.get('text');
      expect(decodedText).toContain('#401/Industrial');
    });

    test('4.4 Correctly encodes percent (%) preventing URI malformed exceptions', () => {
      const prodName = 'CEA 100% RTV Neutral-Cure Silicone';
      const urlStr = buildWhatsAppUrl(prodName, 'rtv-100-percent');

      expect(() => new URL(urlStr)).not.toThrow();
      const parsedUrl = new URL(urlStr);
      const decodedText = parsedUrl.searchParams.get('text');
      expect(decodedText).toContain('100% RTV');
    });

    test('4.5 Correctly encodes quotes, brackets, and slashes', () => {
      const prodName = `CEA "Toughened" Epoxy [Grade A/B] (1:1 Mix)`;
      const urlStr = buildWhatsAppUrl(prodName, 'toughened-epoxy');

      const parsedUrl = new URL(urlStr);
      const decodedText = parsedUrl.searchParams.get('text');
      expect(decodedText).toContain(`"Toughened" Epoxy [Grade A/B] (1:1 Mix)`);
    });

    test('4.6 Correctly encodes multilingual UTF-8 characters losslessly', () => {
      const prodName = 'CEA Теп & Σφραγιστικό — टेप और सीलेंट (Universal)';
      const urlStr = buildWhatsAppUrl(prodName, 'multilingual-tape');

      const parsedUrl = new URL(urlStr);
      const decodedText = parsedUrl.searchParams.get('text');
      expect(decodedText).toContain('Теп & Σφραγιστικό — टेप और सीलेंट');
    });

    test('4.7 Sanitizes varied phone number formats to valid E.164 digits', () => {
      const cases = [
        { input: '+91 98765-43210', expected: '/+919876543210' },
        { input: '+1 (800) 555-0199', expected: '/+18005550199' },
        { input: '   ', expected: '/+919876543210' }, // Fallback to default
        { input: 'invalid-alpha-only', expected: '/+919876543210' }, // Fallback to default
      ];

      for (const c of cases) {
        const urlStr = buildWhatsAppUrl('Test Product', 'test-slug', c.input);
        const parsedUrl = new URL(urlStr);
        expect(parsedUrl.pathname).toBe(c.expected);
      }
    });

    test('4.8 End-to-end DOM verification: Product with special characters renders valid WhatsApp link in UI', async ({ page }) => {
      // Create a temporary product with complex special characters
      const testCategory = await prisma.category.findFirst();
      expect(testCategory).not.toBeNull();

      const specialProduct = await prisma.product.create({
        data: {
          name: 'CEA Adversarial "VHB" Tape & Sealant #999 (+100% Pure)',
          slug: `cea-adv-tape-${Date.now()}`,
          categoryId: testCategory!.id,
          description: 'Special character testing product for adversarial verification',
          specifications: JSON.stringify({ 'Adhesion Rating': '50 N/25mm & >100%' }),
        },
      });

      try {
        await page.goto(`/products/${specialProduct.slug}`);
        await page.waitForLoadState('domcontentloaded');

        const waLink = page.locator('a[data-testid="whatsapp-enquiry"]').first();
        await expect(waLink).toBeVisible();

        const href = await waLink.getAttribute('href');
        expect(href).not.toBeNull();
        expect(href).toMatch(/^https:\/\/wa\.me\/\+?\d+\?text=.+/);

        const url = new URL(href!);
        const textParam = url.searchParams.get('text');
        expect(textParam).not.toBeNull();
        expect(textParam).toContain('CEA Adversarial "VHB" Tape & Sealant #999 (+100% Pure)');
      } finally {
        // Clean up temporary product
        await prisma.product.delete({
          where: { id: specialProduct.id },
        });
      }
    });
  });
});
