import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureAdminUser, prisma } from '../helpers/auth';

test.describe('06 - SQLite WAL Mode & Dynamic Settings Synchronization', () => {
  test.beforeAll(async () => {
    await ensureAdminUser();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Step 1: SQLite database operates in Write-Ahead Logging (WAL) mode', async () => {
    // 1. Check journal_mode pragma
    const journalResult = await prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>(
      'PRAGMA journal_mode;'
    );
    expect(journalResult).toHaveLength(1);
    expect(journalResult[0].journal_mode.toLowerCase()).toBe('wal');

    // 2. Check busy_timeout pragma
    const timeoutResult = await prisma.$queryRawUnsafe<Array<{ timeout: number }>>(
      'PRAGMA busy_timeout;'
    );
    expect(timeoutResult).toHaveLength(1);
    expect(Number(timeoutResult[0].timeout)).toBeGreaterThanOrEqual(5000);
  });

  test('Step 2: SQLite database supports high concurrent reads and writes without SQLITE_BUSY', async () => {
    // Concurrently execute 15 parallel read and write transactions
    const concurrentOperations = Array.from({ length: 15 }, async (_, i) => {
      // Alternate between reads and writes
      if (i % 2 === 0) {
        return prisma.setting.findMany();
      } else {
        return prisma.setting.upsert({
          where: { key: `CONCURRENCY_TEST_${i}` },
          create: {
            key: `CONCURRENCY_TEST_${i}`,
            value: `VAL_${Date.now()}_${i}`,
          },
          update: {
            value: `VAL_UPDATED_${Date.now()}_${i}`,
          },
        });
      }
    });

    const results = await Promise.all(concurrentOperations);
    expect(results).toHaveLength(15);

    // Clean up concurrency test keys
    await prisma.setting.deleteMany({
      where: {
        key: {
          startsWith: 'CONCURRENCY_TEST_',
        },
      },
    });
  });

  test('Step 3: Updating dynamic contact settings in Admin UI persists to SQLite Setting table', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText(/Contact & SMTP Settings/i);

    const testSalesEmail = `rfq-direct-${Date.now()}@commercialeng.com`;
    const testPhone = '+91 11 4455 6677';
    const testWhatsapp = '919876543999';

    // Update settings in form inputs
    const phoneInput = page.locator('label:has-text("Telephone Number") + input');
    await phoneInput.fill(testPhone);

    const emailInput = page.locator('label:has-text("Sales & Quotation Email") + input');
    await emailInput.fill(testSalesEmail);

    const whatsappInput = page.locator('label:has-text("WhatsApp Enquiry Number") + input');
    await whatsappInput.fill(testWhatsapp);

    // Click Save Settings button
    const saveBtn = page.locator('button[type="submit"]:has-text("Save"), button:has-text("Save Settings")').first();
    await saveBtn.click();

    // Verify UI save confirmation
    await expect(page.getByText('Settings Saved!')).toBeVisible({ timeout: 10000 });

    // Directly verify SQLite Setting table via Prisma
    const updatedEmail = await prisma.setting.findUnique({
      where: { key: 'SALES_EMAIL' },
    });
    expect(updatedEmail?.value).toBe(testSalesEmail);

    const updatedPhone = await prisma.setting.findUnique({
      where: { key: 'COMPANY_PHONE' },
    });
    expect(updatedPhone?.value).toBe(testPhone);

    const updatedWhatsapp = await prisma.setting.findUnique({
      where: { key: 'WHATSAPP_NUMBER' },
    });
    expect(updatedWhatsapp?.value).toBe(testWhatsapp);
  });

  test('Step 4: Dynamic settings update propagates to public contact coordinates', async ({ page }) => {
    // Read current phone and email from database
    const dbEmail = await prisma.setting.findUnique({ where: { key: 'SALES_EMAIL' } });
    const dbPhone = await prisma.setting.findUnique({ where: { key: 'COMPANY_PHONE' } });

    expect(dbEmail?.value).toBeTruthy();
    expect(dbPhone?.value).toBeTruthy();

    // Navigate to /contact and assert dynamic values appear (or API fallback if /contact pending M3)
    const response = await page.goto('/contact');
    if (response?.status() === 200) {
      if (dbEmail?.value) {
        await expect(page.locator('body')).toContainText(dbEmail.value);
      }
      if (dbPhone?.value) {
        await expect(page.locator('body')).toContainText(dbPhone.value);
      }
    } else {
      // Prior to M3, verify settings propagation via settings endpoint
      const apiSettings = await page.request.get('/api/admin/settings');
      expect(apiSettings.status()).toBe(200);
      const data = await apiSettings.json();
      expect(data.settingsMap?.SALES_EMAIL).toBe(dbEmail?.value);
      expect(data.settingsMap?.COMPANY_PHONE).toBe(dbPhone?.value);
    }
  });
});
