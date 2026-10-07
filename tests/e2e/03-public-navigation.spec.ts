import { test, expect } from '@playwright/test';
import { prisma } from '../helpers/auth';

test.describe('03 - Public Catalog Navigation and Industrial Specs Verification', () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Step 1: Homepage renders industrial branding, hero section, and navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify Title & Brand Theme
    await expect(page).toHaveTitle(/Commercial Engineering/i);
    const nav = page.locator('header, nav');
    await expect(nav).toBeVisible();
    await expect(nav).toContainText(/Commercial Engineering/i);

    // Verify Hero Section with tapes/sealants motifs
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
    await expect(page.locator('body')).toContainText(/Industrial Tapes|Sealants|Bonding/i);

    // Verify navigation links
    await expect(page.locator('a[href="/products"], nav a:has-text("Products")')).toBeVisible();
    await expect(page.locator('a[href="/categories"], nav a:has-text("Categories")')).toBeVisible();
    await expect(page.locator('a[href="/use-cases"], nav a:has-text("Use Cases")')).toBeVisible();
    await expect(page.locator('a[href="/contact"], nav a:has-text("Contact")')).toBeVisible();
  });

  test('Step 2: Products catalog lists products and supports search/filtering', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Verify catalog header
    await expect(page.locator('h1, h2')).toContainText(/Product|Catalog/i);

    // Verify at least one seeded flagship product card is visible
    const productCard = page.locator('[data-testid="product-card"], a[href*="/products/"], .product-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });

    // Test Search Filter if search input is present
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('VHB');
      await page.waitForTimeout(500); // Debounce
      await expect(page.locator('body')).toContainText(/VHB/i);
    }
  });

  test('Step 3: Product detail page displays structured technical specifications and images', async ({ page }) => {
    // Look up flagship product from database to get dynamic URL
    const flagshipProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: 'cea-vhb-5000-acrylic-foam-tape' },
          { name: { contains: 'VHB' } },
        ],
      },
    });

    const targetUrl = flagshipProduct
      ? `/products/${flagshipProduct.slug}`
      : '/products/cea-vhb-5000-acrylic-foam-tape';

    await page.goto(targetUrl);
    await page.waitForLoadState('domcontentloaded');

    // Verify product title
    await expect(page.locator('h1')).toContainText(/VHB|Acrylic Foam Tape|Product/i);

    // Verify Structured Technical Specifications Table
    const specsTable = page.locator('table, [data-testid="specs-table"], [data-testid="technical-specs"]');
    await expect(specsTable).toBeVisible({ timeout: 10000 });
    await expect(specsTable).toContainText(/Thickness|Adhesion|Tensile|Strength|Temperature/i);

    // Verify product action triggers exist
    const whatsappBtn = page.locator('a[href*="wa.me"], button:has-text("WhatsApp"), [data-testid="whatsapp-enquiry"]');
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart"]');
    await expect(whatsappBtn).toBeVisible();
    await expect(addToCartBtn).toBeVisible();
  });

  test('Step 4: Categories directory and detail page list assigned products', async ({ page }) => {
    // 1. Visit /categories
    await page.goto('/categories');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2')).toContainText(/Categories|Classifications/i);
    const categoryCard = page.locator('a[href*="/categories/"]').first();
    await expect(categoryCard).toBeVisible({ timeout: 10000 });

    // 2. Click category or navigate to category detail
    const testCat = await prisma.category.findFirst({
      where: { slug: 'adhesive-tapes' },
    });
    const catUrl = testCat ? `/categories/${testCat.slug}` : '/categories/adhesive-tapes';

    await page.goto(catUrl);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText(/Adhesive Tapes|Category/i);
    // Detail must display products filtered by category
    await expect(page.locator('body')).toContainText(/VHB|Product/i);
  });

  test('Step 5: Industrial Use-Cases directory and detail page list engineering solutions', async ({ page }) => {
    // 1. Visit /use-cases
    await page.goto('/use-cases');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2')).toContainText(/Use Cases|Applications|Industries/i);
    const useCaseCard = page.locator('a[href*="/use-cases/"]').first();
    await expect(useCaseCard).toBeVisible({ timeout: 10000 });

    // 2. Navigate to use-case detail
    const testUseCase = await prisma.useCase.findFirst({
      where: { slug: 'automotive-ev' },
    });
    const ucUrl = testUseCase ? `/use-cases/${testUseCase.slug}` : '/use-cases/automotive-ev';

    await page.goto(ucUrl);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText(/Automotive|EV|Battery|Application/i);
  });

  test('Step 6: Contact page loads dynamic contact details from SQLite Setting records', async ({ page }) => {
    // Fetch expected settings from database
    const dbPhone = await prisma.setting.findUnique({ where: { key: 'COMPANY_PHONE' } });
    const dbEmail = await prisma.setting.findUnique({ where: { key: 'SALES_EMAIL' } });
    const dbAddress = await prisma.setting.findUnique({ where: { key: 'COMPANY_ADDRESS' } });

    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2')).toContainText(/Contact|Consultation|Inquiry/i);

    // Verify dynamic DB values are rendered
    if (dbPhone?.value) {
      await expect(page.locator('body')).toContainText(dbPhone.value);
    }
    if (dbEmail?.value) {
      await expect(page.locator('body')).toContainText(dbEmail.value);
    }
    if (dbAddress?.value) {
      await expect(page.locator('body')).toContainText(dbAddress.value);
    }

    // Verify contact form fields
    await expect(page.locator('input[name="name"], input#name')).toBeVisible();
    await expect(page.locator('input[name="email"], input#email')).toBeVisible();
    await expect(page.locator('textarea[name="message"], textarea#message, textarea[name="projectDetails"]')).toBeVisible();
  });
});
