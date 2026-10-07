import { test, expect } from '@playwright/test';
import { prisma, ensureAdminUser, loginAsAdmin } from '../helpers/auth';

test.describe('08 - Light Theme & Logo Integration Audit', () => {
  test.beforeAll(async () => {
    await ensureAdminUser();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Public header and footer properly integrate logo.webp', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Header logo
    const headerLogo = page.locator('header img[src*="logo.webp"]');
    await expect(headerLogo).toBeVisible();
    const headerLogoLoaded = await headerLogo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(headerLogoLoaded).toBe(true);

    // Footer logo
    const footerLogo = page.locator('footer img[src*="logo.webp"]');
    await footerLogo.scrollIntoViewIfNeeded();
    await expect(footerLogo).toBeVisible();
    const footerLogoLoaded = await footerLogo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(footerLogoLoaded).toBe(true);
  });

  test('Public pages render true light theme (white/light body and dark typography)', async ({ page }) => {
    const routes = ['/', '/products', '/categories', '/use-cases', '/cart', '/contact', '/admin/login', '/setup'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // Verify body background is light
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      // rgb(255, 255, 255) is white
      expect(bgColor).toBe('rgb(255, 255, 255)');

      // Verify no dark slate class leaks or dark gradient overlay leaks on the page
      const darkLeaks = await page.evaluate(() => {
        const darkElements = document.querySelectorAll('.bg-slate-950, .bg-slate-900, [class*="from-gray-900"]');
        return darkElements.length;
      });
      expect(darkLeaks).toBe(0);
    }
  });

  test('Mobile navigation menu renders with light theme and accessible links', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Header logo should still be visible on mobile
    const mobileHeaderLogo = page.locator('header img[src*="logo.webp"]');
    await expect(mobileHeaderLogo).toBeVisible();

    // Hamburger button should be visible
    const menuButton = page.locator('button[aria-label="Toggle Navigation Menu"]');
    await expect(menuButton).toBeVisible();

    // Open mobile menu
    await menuButton.click();

    // Menu dropdown should be visible, white bg, dark text
    const mobileMenu = page.locator('header .md\\:hidden.bg-white');
    await expect(mobileMenu).toBeVisible();

    const mobileMenuBg = await mobileMenu.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(mobileMenuBg).toBe('rgb(255, 255, 255)');

    // Verify nav links have dark text
    const linkColor = await page.locator('header .md\\:hidden.bg-white a').first().evaluate((el) => window.getComputedStyle(el).color);
    expect(linkColor).not.toBe('rgb(255, 255, 255)');
  });

  test('Category and use-case cards render with light theme badges and dark typography', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify all category & use-case card headings on home page are dark typography (not text-white)
    const cardHeadings = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('a[href*="/categories/"] h3, a[href*="/use-cases/"] h3'));
      return headings.map((h) => {
        const style = window.getComputedStyle(h);
        return {
          color: style.color,
          hasWhiteText: h.classList.contains('text-white'),
        };
      });
    });

    expect(cardHeadings.length).toBeGreaterThan(0);
    for (const h of cardHeadings) {
      expect(h.hasWhiteText).toBe(false);
      expect(h.color).not.toBe('rgb(255, 255, 255)');
    }

    // Verify no dark overlay gradients in card image containers
    const darkOverlays = await page.evaluate(() => {
      return document.querySelectorAll('a[href*="/categories/"] [class*="from-gray-900"], a[href*="/use-cases/"] [class*="from-gray-900"]').length;
    });
    expect(darkOverlays).toBe(0);
  });

  test('Enquiry Cart drawer renders with light theme background and dark text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open Cart Drawer
    await page.click('[data-testid="navbar-cart-btn"]');
    const drawer = page.locator('[data-testid="enquiry-cart-drawer"]');
    await expect(drawer).toBeVisible();

    // Drawer content container should be white
    const drawerBg = await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="enquiry-cart-drawer"] .w-screen');
      return panel ? window.getComputedStyle(panel).backgroundColor : null;
    });
    expect(drawerBg).toBe('rgb(255, 255, 255)');

    // Close Cart Drawer
    await page.click('[data-testid="close-cart-drawer-btn"]');
    await expect(drawer).toBeHidden();
  });

  test('Email enquiry modal renders with light theme dialog and inputs', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Click the first product card
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // On product detail page, click email enquiry trigger
    const emailModalBtn = page.locator('[data-testid="email-enquiry"]');
    await expect(emailModalBtn).toBeVisible();
    await emailModalBtn.click();

    // Verify modal dialog card is visible and light
    const modalHeading = page.locator('span:has-text("Product Enquiry")');
    await expect(modalHeading).toBeVisible();

    const isLightCard = await page.evaluate(() => {
      // Find the dialog card containing the modal heading
      const dialog = document.querySelector('.fixed.inset-0 .bg-white');
      if (!dialog) return false;
      const style = window.getComputedStyle(dialog);
      return style.backgroundColor === 'rgb(255, 255, 255)';
    });
    expect(isLightCard).toBe(true);

    // Verify no dark slate classes in modal
    const modalDarkLeaks = await page.evaluate(() => {
      return document.querySelectorAll('.fixed.inset-0 .bg-slate-950, .fixed.inset-0 .bg-slate-900').length;
    });
    expect(modalDarkLeaks).toBe(0);
  });

  test('Admin portal pages and modal dialogs render with complete light theme', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAdmin(page);

    // 1. Overview Page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const adminLogo = page.locator('header img[alt="CEA Logo"]');
    await expect(adminLogo).toBeVisible();
    const adminLogoLoaded = await adminLogo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(adminLogoLoaded).toBe(true);

    // 2. Products Page & Modal
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add Product")');

    // Add Product modal should be light
    const addProductHeading = page.locator('h2:has-text("New Industrial Product")');
    await expect(addProductHeading).toBeVisible();

    let adminModalLight = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 .bg-white');
      return modal ? window.getComputedStyle(modal).backgroundColor : null;
    });
    expect(adminModalLight).toBe('rgb(255, 255, 255)');

    // Close product modal
    await page.click('button:has-text("Cancel")');

    // Test Delete Confirmation modal if product exists
    const deleteBtn = page.locator('button[title="Delete Product"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.locator('h3:has-text("Confirm Product Deletion")')).toBeVisible();
      const deleteModalLight = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0 .bg-white');
        return modal ? window.getComputedStyle(modal).backgroundColor : null;
      });
      expect(deleteModalLight).toBe('rgb(255, 255, 255)');
      await page.click('button:has-text("Cancel")');
    }

    // 3. Categories Page & Modal
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add Category")');
    await expect(page.locator('h2:has-text("New Category")')).toBeVisible();
    adminModalLight = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 .bg-white');
      return modal ? window.getComputedStyle(modal).backgroundColor : null;
    });
    expect(adminModalLight).toBe('rgb(255, 255, 255)');
    await page.click('button:has-text("Cancel")');

    // 4. Use-Cases Page & Modal
    await page.goto('/admin/use-cases');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add Use-Case")');
    await expect(page.locator('h2:has-text("New Use Case")')).toBeVisible();
    adminModalLight = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 .bg-white');
      return modal ? window.getComputedStyle(modal).backgroundColor : null;
    });
    expect(adminModalLight).toBe('rgb(255, 255, 255)');
    await page.click('button:has-text("Cancel")');

    // 5. Hero Slides Page & Modal
    await page.goto('/admin/hero');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add Hero Slide")');
    await expect(page.locator('h2:has-text("New Hero Slide")')).toBeVisible();
    adminModalLight = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 .bg-white');
      return modal ? window.getComputedStyle(modal).backgroundColor : null;
    });
    expect(adminModalLight).toBe('rgb(255, 255, 255)');
    await page.click('button:has-text("Cancel")');

    // 6. Enquiries Page
    await page.goto('/admin/enquiries');
    await page.waitForLoadState('networkidle');
    const enquiriesDarkLeaks = await page.evaluate(() => {
      return document.querySelectorAll('.bg-slate-950, .bg-slate-900, [class*="from-gray-900"]').length;
    });
    expect(enquiriesDarkLeaks).toBe(0);

    // 7. Settings Page
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Verify 0 dark slate elements anywhere across admin settings
    const settingsDarkLeaks = await page.evaluate(() => {
      return document.querySelectorAll('.bg-slate-950, .bg-slate-900, [class*="from-gray-900"]').length;
    });
    expect(settingsDarkLeaks).toBe(0);
  });

  test('Footer dynamically fetches and renders contact details from database', async ({ page }) => {
    // Read current phone and email from Prisma setting table
    const dbEmail = await prisma.setting.findUnique({ where: { key: 'SALES_EMAIL' } });
    const dbPhone = await prisma.setting.findUnique({ where: { key: 'COMPANY_PHONE' } });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    if (dbEmail?.value) {
      const emailLink = footer.locator(`a[href="mailto:${dbEmail.value}"]`);
      await expect(emailLink).toBeVisible();
      await expect(emailLink).toContainText(dbEmail.value);
    }

    if (dbPhone?.value) {
      await expect(footer).toContainText(dbPhone.value);
    }
  });

  test('Proper branded WhatsApp icons render cleanly in light theme', async ({ page }) => {
    // 1. Verify on /contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const contactWaIcon = page.locator('.rounded-xl:has-text("WhatsApp") svg[viewBox="0 0 24 24"]');
    await expect(contactWaIcon).toBeVisible();

    // 2. Verify on product detail page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="product-card"]').first().click();

    const productWaButton = page.locator('[data-testid="whatsapp-enquiry"]');
    await expect(productWaButton).toBeVisible();
    const productWaIcon = productWaButton.locator('svg[viewBox="0 0 24 24"]');
    await expect(productWaIcon).toBeVisible();
  });
});
