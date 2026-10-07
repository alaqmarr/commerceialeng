import { Page, expect } from '@playwright/test';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../prisma/generated/client';

export const TEST_ADMIN = {
  name: 'Chief Operating Engineer',
  email: 'admin@commercialeng.com',
  password: 'AdminPassword2026!',
};

const prisma = new PrismaClient();

/**
 * Resets all admin user records to test first-run /setup state.
 */
export async function resetAdminUsers(): Promise<void> {
  await prisma.adminUser.deleteMany();
}

/**
 * Ensures a test admin account exists in SQLite database.
 */
export async function ensureAdminUser(
  email = TEST_ADMIN.email,
  password = TEST_ADMIN.password,
  name = TEST_ADMIN.name
): Promise<void> {
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {
      name,
      password: hashedPassword,
    },
    create: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });
}

/**
 * Helper to log in as admin via UI.
 */
export async function loginAsAdmin(
  page: Page,
  email = TEST_ADMIN.email,
  password = TEST_ADMIN.password
): Promise<void> {
  await ensureAdminUser(email, password);
  await page.goto('/admin/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"], button[data-testid="login-submit-btn"]');

  try {
    await page.waitForURL('**/admin', { timeout: 10000 });
  } catch {
    // If CSRF took an extra cycle to initialize, retry clicking submit once
    if (page.url().includes('/admin/login')) {
      await page.waitForTimeout(500);
      await page.click('button[type="submit"], button[data-testid="login-submit-btn"]');
      await page.waitForURL('**/admin', { timeout: 15000 });
    }
  }

  await expect(page.locator('body')).toContainText(/Signed in as|Admin Console|System Overview/i);
}

export { prisma };
