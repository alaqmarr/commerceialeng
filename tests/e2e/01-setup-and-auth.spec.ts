import { test, expect } from '@playwright/test';
import { prisma, resetAdminUsers, TEST_ADMIN } from '../helpers/auth';

test.describe('01 - Setup and Authentication Flow', () => {
  test.beforeAll(async () => {
    // Reset admin user to ensure clean first-run /setup test state
    await resetAdminUsers();
  });

  test.afterAll(async () => {
    // Disconnect prisma client
    await prisma.$disconnect();
  });

  test('Step 1: First-run /setup displays initialization form with required fields', async ({ page }) => {
    await page.goto('/setup');
    await expect(page).toHaveTitle(/Commercial Engineering/i);

    // Verify uninitialized setup container and title
    const setupForm = page.locator('[data-testid="setup-form-container"]');
    await expect(setupForm).toBeVisible();
    await expect(page.locator('h1')).toContainText(/System Initialization/i);

    // Verify all input fields are present
    await expect(page.locator('input[name="name"], [data-testid="setup-name"]')).toBeVisible();
    await expect(page.locator('input[name="email"], [data-testid="setup-email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], [data-testid="setup-password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"], [data-testid="setup-confirm-password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], [data-testid="setup-submit-btn"]')).toBeVisible();
  });

  test('Step 2: Client-side validation rejects mismatched passwords on /setup', async ({ page }) => {
    await page.goto('/setup');
    await page.fill('input[name="name"], [data-testid="setup-name"]', 'Admin Candidate');
    await page.fill('input[name="email"], [data-testid="setup-email"]', 'admin-mismatch@commercialeng.com');
    await page.fill('input[name="password"], [data-testid="setup-password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"], [data-testid="setup-confirm-password"]', 'PasswordDifferent!');
    await page.click('button[type="submit"], [data-testid="setup-submit-btn"]');

    // Verify error banner appears
    const errorBanner = page.locator('[data-testid="setup-error-msg"], .text-red-400');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/match/i);
  });

  test('Step 3: Creates first admin account and redirects to /admin/login', async ({ page }) => {
    await page.goto('/setup');
    await page.fill('input[name="name"], [data-testid="setup-name"]', TEST_ADMIN.name);
    await page.fill('input[name="email"], [data-testid="setup-email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"], [data-testid="setup-password"]', TEST_ADMIN.password);
    await page.fill('input[name="confirmPassword"], [data-testid="setup-confirm-password"]', TEST_ADMIN.password);

    await page.click('button[type="submit"], [data-testid="setup-submit-btn"]');

    // Wait for redirect to login page
    await page.waitForURL('**/admin/login**', { timeout: 15000 });
    await expect(page).toHaveURL(/.*admin\/login.*/);

    // Verify database has created the admin user
    const adminCount = await prisma.adminUser.count();
    expect(adminCount).toBe(1);

    const createdAdmin = await prisma.adminUser.findUnique({
      where: { email: TEST_ADMIN.email.toLowerCase() },
    });
    expect(createdAdmin).not.toBeNull();
    expect(createdAdmin?.email).toBe(TEST_ADMIN.email.toLowerCase());
  });

  test('Step 4: Re-visiting /setup displays locked state and rejects secondary admin creation', async ({ page, request }) => {
    // 1. Visit UI - must show locked gate
    await page.goto('/setup');
    const lockedContainer = page.locator('[data-testid="setup-locked-container"]');
    await expect(lockedContainer).toBeVisible();
    await expect(page.locator('body')).toContainText(/Setup Gate Locked|already been initialized/i);

    // 2. Direct API call to /api/setup must return 403 Forbidden
    const res = await request.post('/api/setup', {
      data: {
        name: 'Intruder Admin',
        email: 'intruder@commercialeng.com',
        password: 'IntruderPassword2026!',
      },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/Setup already completed|locked/i);
  });

  test('Step 5: Admin login rejects invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"], [data-testid="login-email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"], [data-testid="login-password"]', 'WrongPassword999!');
    await page.click('button[type="submit"], [data-testid="login-submit-btn"]');

    // Expect error banner
    const errorBanner = page.locator('[data-testid="login-error-msg"], .text-red-400');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/Invalid email or password|credentials/i);
  });

  test('Step 6: Admin logs in with valid credentials and redirects to /admin dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"], [data-testid="login-email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"], [data-testid="login-password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"], [data-testid="login-submit-btn"]');

    // Verify redirect to /admin dashboard
    await page.waitForURL('**/admin', { timeout: 25000 });
    await expect(page).toHaveURL(/.*\/admin$/);
    await expect(page.locator('h1')).toContainText(/System Overview/i);
    await expect(page.locator('body')).toContainText(TEST_ADMIN.email.toLowerCase());
  });

  test('Step 7: Protected admin routes redirect unauthenticated users to /admin/login', async ({ browser }) => {
    // Create fresh context without session cookies
    const context = await browser.newContext();
    const cleanPage = await context.newPage();

    await cleanPage.goto('/admin');
    await cleanPage.waitForURL('**/admin/login**', { timeout: 10000 });
    await expect(cleanPage).toHaveURL(/.*admin\/login.*/);

    await context.close();
  });
});
