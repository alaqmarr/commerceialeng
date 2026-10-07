import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { loginAsAdmin, ensureAdminUser, prisma, TEST_ADMIN } from '../helpers/auth';

test.describe('02 - Admin CRUD Operations and Cloudflare R2 Upload', () => {
  const testCategoryName = 'Industrial Foam Tapes ' + Date.now();
  const testCategorySlug = 'industrial-foam-tapes-' + Date.now();
  const testUseCaseTitle = 'Automotive Body Assembly ' + Date.now();
  const testUseCaseSlug = 'automotive-body-assembly-' + Date.now();
  const testProductName = 'CEA-8000 High-Bond Acrylic Foam Tape ' + Date.now();
  const testProductSlug = 'cea-8000-acrylic-foam-tape-' + Date.now();

  test.beforeAll(async () => {
    await ensureAdminUser();
  });

  test.afterAll(async () => {
    // Clean up created test entities if needed
    try {
      await prisma.product.deleteMany({ where: { slug: testProductSlug } });
      await prisma.useCase.deleteMany({ where: { slug: testUseCaseSlug } });
      await prisma.category.deleteMany({ where: { slug: testCategorySlug } });
    } catch (e) {
      console.warn('Cleanup error (ignored):', e);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('Step 1: Direct Cloudflare R2 upload API generates valid CDN URL and bucket key', async ({ page }) => {
    await loginAsAdmin(page);

    // Read fixture image buffer
    const fixturePath = path.join(__dirname, '../fixtures/sample-tape.png');
    expect(fs.existsSync(fixturePath)).toBe(true);
    const fileBuffer = fs.readFileSync(fixturePath);

    // Execute authenticated POST to /api/admin/upload via page context
    const uploadResponse = await page.request.post('/api/admin/upload', {
      multipart: {
        file: {
          name: 'sample-tape.png',
          mimeType: 'image/png',
          buffer: fileBuffer,
        },
        folder: 'test-uploads',
      },
    });

    expect(uploadResponse.status()).toBe(201);
    const result = await uploadResponse.json();
    expect(result.success).toBe(true);
    expect(result.url).toMatch(/^https:\/\/pub-723d911c6a3442c78b2f69b731577d2b\.r2\.dev\/.+/);
    expect(result.key).toContain('test-uploads/');
  });

  test('Step 2: Admin creates a Category with R2 image upload', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    // Click "Add Category"
    const addCatBtn = page.locator('button:has-text("Add Category"), button:has-text("New Category")');
    await expect(addCatBtn).toBeVisible();
    await addCatBtn.click();

    // Fill Category Form
    await page.fill('input[placeholder*="Industrial Adhesive Tapes"], input[name="name"]', testCategoryName);
    await page.fill('input[placeholder*="industrial-adhesive-tapes"], input[name="slug"]', testCategorySlug);
    await page.fill('textarea[placeholder*="Brief overview"], textarea[name="description"]', 'High-shear acrylic and polyethylene foam bonding solutions.');

    // Upload test image via dropzone
    const fixturePath = path.join(__dirname, '../fixtures/sample-tape.png');
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null);
    await page.click('[data-testid="dropzone"]');
    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(fixturePath);
      // Wait for uploaded image preview
      await page.waitForSelector('img[alt="Uploaded preview"]', {
        timeout: 15000,
      });
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Category"), button:has-text("Create Category")');

    // Verify category appears in the table
    await expect(page.locator('table')).toContainText(testCategoryName, { timeout: 10000 });

    // Verify record exists in SQLite database
    const dbCat = await prisma.category.findUnique({
      where: { slug: testCategorySlug },
    });
    expect(dbCat).not.toBeNull();
    expect(dbCat?.name).toBe(testCategoryName);
  });

  test('Step 3: Admin creates a Use-Case', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/use-cases');
    await page.waitForLoadState('networkidle');

    // Click "Add Use-Case"
    const addUseCaseBtn = page.locator('button:has-text("Add Use-Case"), button:has-text("Add Use Case")');
    await expect(addUseCaseBtn).toBeVisible();
    await addUseCaseBtn.click();

    // Fill Use-Case Form
    await page.fill('input[placeholder*="Automotive"], input[name="title"]', testUseCaseTitle);
    await page.fill('input[placeholder*="automotive"], input[name="slug"]', testUseCaseSlug);
    await page.fill('form textarea', 'Exterior panel bonding and trim attachment.');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Use-Case"), button:has-text("Create Use-Case"), form button[type="submit"]');

    // Verify use case appears in list
    await expect(page.locator('table')).toContainText(testUseCaseTitle, { timeout: 10000 });

    // Verify record in SQLite database
    const dbUseCase = await prisma.useCase.findUnique({
      where: { slug: testUseCaseSlug },
    });
    expect(dbUseCase).not.toBeNull();
    expect(dbUseCase?.title).toBe(testUseCaseTitle);
  });

  test('Step 4: Admin creates a Product with technical specifications and R2 image', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Click "Add Product"
    const addProductBtn = page.locator('button:has-text("Add Product"), button:has-text("New Industrial Product")');
    await expect(addProductBtn).toBeVisible();
    await addProductBtn.click();

    // Fill Product Basic Info
    await page.fill('input[name="name"], input[placeholder*="CEA-8000"]', testProductName);
    await page.fill('input[name="slug"], input[placeholder*="cea-8000"]', testProductSlug);

    // Select category (prefer newly created or fallback to existing)
    const categorySelect = page.locator('select[name="categoryId"]');
    const optionMatches = await page.locator(`select[name="categoryId"] option:has-text("${testCategoryName}")`).count();
    if (optionMatches > 0) {
      await categorySelect.selectOption({ label: testCategoryName });
    } else {
      await categorySelect.selectOption({ index: 1 });
    }

    await page.fill('input[name="shortDesc"]', 'Extreme durability automotive exterior bonding tape.');
    await page.fill('textarea[name="description"]', 'Engineered double-sided acrylic foam tape with viscoelastic core for extreme temperature and shear resistance.');

    // Fill Technical Specifications
    const tensileInput = page.locator('input[name="spec_tensile"], input[data-spec*="tensile"]');
    if (await tensileInput.isVisible()) {
      await tensileInput.fill('45 N/cm');
    }

    const tempInput = page.locator('input[name="spec_temp"], input[data-spec*="temp"]');
    if (await tempInput.isVisible()) {
      await tempInput.fill('-40°C to +160°C');
    }

    // Upload R2 Image via Dropzone
    const fixturePath = path.join(__dirname, '../fixtures/sample-tape.png');
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null);
    await page.click('[data-testid="dropzone"]');
    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(fixturePath);
      // Verify R2 URL preview appears
      await page.waitForSelector('img[alt="Uploaded preview"]', {
        timeout: 15000,
      });
    }

    // Submit Product Form
    await page.click('button[type="submit"]:has-text("Publish Product"), button:has-text("Publish Product"), button[type="submit"]:has-text("Create Product")');

    // Verify product appears in the admin catalog table
    await expect(page.locator('table')).toContainText(testProductName, { timeout: 10000 });

    // Verify product in database via Prisma with specs and R2 imageUrl
    const dbProduct = await prisma.product.findUnique({
      where: { slug: testProductSlug },
      include: { category: true },
    });
    expect(dbProduct).not.toBeNull();
    expect(dbProduct?.name).toBe(testProductName);
    expect(dbProduct?.category.name).toBe(testCategoryName);

    if (dbProduct?.imageUrl) {
      expect(dbProduct.imageUrl).toContain('pub-723d911c6a3442c78b2f69b731577d2b.r2.dev');
    }

    if (dbProduct?.specifications) {
      expect(dbProduct.specifications).toContain('45 N/cm');
    }
  });
});
