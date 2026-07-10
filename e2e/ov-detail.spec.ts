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

test.describe('OV Detail', () => {
  test('carrega detalhes de uma OV existente', async ({ page, request }) => {
    const ov = await request
      .get('/api/ordensVenda')
      .then((r) => r.json())
      .then((arr: Array<{ id: string; numero: string }>) => arr[0]);
    const ovId = ov.id;
    const ovNumero = ov.numero;

    await loginAdmin(page);

    await page.goto(`/ovs/${ovId}`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await expect(page.getByText(ovNumero)).toBeVisible({ timeout: 5000 });
  });

  test('mostra 404 para OV inexistente', async ({ page }) => {
    await loginAdmin(page);

    await page.goto('/ovs/00000000-0000-4000-8000-000000000000');
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await expect(page.getByText('Ordem de venda não encontrada')).toBeVisible();
  });
});
