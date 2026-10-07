import { test, expect } from '@playwright/test';
import { prisma } from '../helpers/auth';

test.describe('04 - Enquiry Cart, WhatsApp Direct and RFQ Checkout Flow', () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Step 1: Product detail displays valid WhatsApp enquiry link with encoded parameters', async ({ page }) => {
    // Fetch product and dynamic WhatsApp number from DB
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: 'cea-vhb-5000-acrylic-foam-tape' },
          { name: { contains: 'VHB' } },
        ],
      },
    });

    const productUrl = product ? `/products/${product.slug}` : '/products/cea-vhb-5000-acrylic-foam-tape';
    await page.goto(productUrl);
    await page.waitForLoadState('domcontentloaded');

    // Find WhatsApp button
    const waLink = page.locator('a[href*="wa.me"], [data-testid="whatsapp-enquiry"]').first();
    await expect(waLink).toBeVisible({ timeout: 10000 });

    const href = await waLink.getAttribute('href');
    expect(href).not.toBeNull();
    // Validate wa.me format with country code and query text
    expect(href).toMatch(/^https:\/\/wa\.me\/\+?\d+\?text=.+/);

    // Verify text parameter is URL encoded and mentions product
    const url = new URL(href!);
    const textParam = url.searchParams.get('text');
    expect(textParam).not.toBeNull();
    expect(textParam?.toLowerCase()).toContain('commercial engineering');
  });

  test('Step 2: Adds product to enquiry cart, opens drawer, and verifies quantity', async ({ page }) => {
    const product = await prisma.product.findFirst();
    const productUrl = product ? `/products/${product.slug}` : '/products/cea-vhb-5000-acrylic-foam-tape';

    await page.goto(productUrl);
    await page.waitForLoadState('domcontentloaded');

    // Click "Add to Cart"
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart"]').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // Verify Cart Drawer opens automatically
    const cartDrawer = page.locator('[data-testid="enquiry-cart-drawer"], div[role="dialog"]');
    await expect(cartDrawer).toBeVisible({ timeout: 10000 });
    await expect(cartDrawer).toContainText(/Enquiry Cart/i);

    // Verify navbar cart badge updates to at least 1
    const cartBadge = page.locator('[data-testid="cart-badge-count"], [data-testid="cart-badge"]');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText(/[1-9]\d*/);

    // Verify Proceed to Checkout button is visible
    const checkoutLink = page.locator('[data-testid="proceed-to-checkout-btn"], a[href="/cart"], a:has-text("Proceed to RFQ Checkout")').first();
    await expect(checkoutLink).toBeVisible();
  });

  test('Step 3: Submits RFQ cart checkout, persists Enquiry in SQLite, and resets cart', async ({ page }) => {
    // 1. Visit product page and add item
    const product = await prisma.product.findFirst();
    const productUrl = product ? `/products/${product.slug}` : '/products/cea-vhb-5000-acrylic-foam-tape';

    await page.goto(productUrl);
    await page.waitForLoadState('domcontentloaded');

    const addToCartBtn = page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart"]').first();
    await addToCartBtn.click();

    // 2. Navigate to /cart checkout page
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2')).toContainText(/Cart|Checkout|Request For Quotation|RFQ/i);

    const testRfqEmail = `rfq-${Date.now()}@apexindustries.in`;
    const testCustomerName = 'Vikram Malhotra';

    // 3. Fill RFQ Form
    await page.fill('input[name="name"], input#name', testCustomerName);
    await page.fill('input[name="email"], input#email', testRfqEmail);
    const phoneInput = page.locator('input[name="phone"], input#phone');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+91 98200 12345');
    }
    const companyInput = page.locator('input[name="company"], input#company');
    if (await companyInput.isVisible()) {
      await companyInput.fill('Apex Automotive Engineering');
    }
    const detailsInput = page.locator('textarea[name="message"], textarea#message, textarea[name="projectDetails"]');
    if (await detailsInput.isVisible()) {
      await detailsInput.fill('Need 50 rolls for EV battery pack thermal bonding and sealing.');
    }

    // 4. Submit Enquiry
    const submitBtn = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Request for Quotation"), [data-testid="submit-rfq-btn"]').first();
    await submitBtn.click();

    // 5. Verify Confirmation Screen or Notification
    await expect(page.locator('body')).toContainText(/Successfully Submitted|Enquiry Submitted|Thank You|Confirmation/i, {
      timeout: 15000,
    });

    // 6. Verify cart badge resets
    const badge = page.locator('[data-testid="cart-badge-count"]');
    if (await badge.isVisible()) {
      await expect(badge).toHaveText('0');
    }

    // 7. Directly verify Enquiry and EnquiryItem record exists in SQLite DB via Prisma
    const dbEnquiry = await prisma.enquiry.findFirst({
      where: { email: testRfqEmail },
      include: { items: true },
    });

    expect(dbEnquiry).not.toBeNull();
    expect(dbEnquiry?.name).toBe(testCustomerName);
    expect(dbEnquiry?.items.length).toBeGreaterThan(0);
  });
});
