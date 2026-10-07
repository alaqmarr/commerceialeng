import { test, expect } from '@playwright/test';
import { prisma } from '../helpers/auth';

test.describe('05 - Programmatic Route Crawler (Zero 404 / 500 Errors)', () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  const basePublicRoutes = [
    '/',
    '/products',
    '/categories',
    '/use-cases',
    '/contact',
    '/cart',
    '/setup',
    '/admin/login',
  ];

  for (const route of basePublicRoutes) {
    test(`Route ${route} responds with valid status (no 404 or 500)`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).not.toBeNull();

      const status = response!.status();
      // Ensure strictly 0 404 and 0 500 errors
      expect(status, `Route ${route} returned HTTP 404 Not Found`).not.toBe(404);
      expect(status, `Route ${route} returned HTTP 500 Server Error`).not.toBe(500);
      expect([200, 304, 307, 308]).toContain(status);

      // Verify DOM root renders
      await expect(page.locator('body')).toBeVisible();

      // Filter console errors (ignoring benign favicon or external font 404s)
      const criticalErrors = consoleErrors.filter(
        (err) =>
          !err.includes('favicon.ico') &&
          !err.includes('status of 404') &&
          !err.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED')
      );
      expect(criticalErrors, `Console errors on ${route}: ${criticalErrors.join(', ')}`).toHaveLength(0);
    });
  }

  test('Crawls dynamic detail routes for seeded products, categories, and use-cases', async ({ page }) => {
    // 1. Fetch dynamic entities from database
    const product = await prisma.product.findFirst({ select: { slug: true } });
    const category = await prisma.category.findFirst({ select: { slug: true } });
    const useCase = await prisma.useCase.findFirst({ select: { slug: true } });

    const dynamicRoutes: string[] = [];
    if (product) dynamicRoutes.push(`/products/${product.slug}`);
    if (category) dynamicRoutes.push(`/categories/${category.slug}`);
    if (useCase) dynamicRoutes.push(`/use-cases/${useCase.slug}`);

    for (const route of dynamicRoutes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).not.toBeNull();

      const status = response!.status();
      expect(status, `Dynamic route ${route} returned 404`).not.toBe(404);
      expect(status, `Dynamic route ${route} returned 500`).not.toBe(500);
      expect([200, 304]).toContain(status);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
