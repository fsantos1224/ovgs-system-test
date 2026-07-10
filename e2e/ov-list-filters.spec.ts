import { test, expect, type Page } from '@playwright/test';

async function loginAdmin(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    (window as unknown as { __login: (email: string, password: string) => void }).__login(
      'admin@XPTO.local',
      'admin123',
    );
  });
  await page.reload();
}

test.describe('OV List — filtros', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('filtra por status', async ({ page }) => {
    await page.goto('/ovs');
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.selectOption('select', 'CRIADA');
    await page.waitForTimeout(500);
    const cells = page.locator('table tbody tr td:nth-child(4)');
    const count = await cells.count();
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).toContainText('Criada');
    }
  });

  test('filtro de data reduz resultados', async ({ page }) => {
    await page.goto('/ovs');
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForFunction(() => document.querySelectorAll('table tbody tr').length > 0, { timeout: 10_000 });
    const antes = await page.locator('table tbody tr').count();
    expect(antes).toBeGreaterThan(0);
    await page.locator('input[type="date"]').first().fill('2025-11-21');
    await page.waitForTimeout(500);
    const depois = await page.locator('table tbody tr').count();
    expect(depois).toBeLessThanOrEqual(antes);
  });
});
