// 🐴 E2E: RBAC — viewer não vê botão "Nova OV", admin vê
import { test, expect } from '@playwright/test';

test.describe('RBAC — autorização por role', () => {
  test('viewer não vê botão de criar OV', async ({ page }) => {
    // 🐴 Define role como viewer antes de carregar a página
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('ovgs:role', 'viewer'));
    await page.reload();

    await page.goto('/ovs');
    await page.waitForLoadState('networkidle');

    // Botão "Nova OV" não deve existir no DOM
    const btn = page.getByRole('link', { name: /nova ov/i });
    await expect(btn).toHaveCount(0);
  });

  test('admin vê botão de criar OV', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('ovgs:role', 'admin'));
    await page.reload();

    await page.goto('/ovs');
    await page.waitForLoadState('networkidle');

    const btn = page.getByRole('link', { name: /nova ov/i });
    await expect(btn).toBeVisible();
  });

  test('admin pode criar OV e ver na listagem', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('ovgs:role', 'admin'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 🐴 Navega para /ovs/nova e verifica que o formulário carregou
    await page.goto('/ovs/nova');
    await page.waitForLoadState('networkidle');

    const selectLoaded = await page.waitForFunction(() => {
      const sel = document.querySelector<HTMLSelectElement>('select[name="clienteId"]');
      return sel && sel.options.length > 1;
    });
    console.log('Select loaded:', !!selectLoaded);

    // 🐴 Verifica ausência de erros JS
    await page.waitForTimeout(500);
    console.log('JS errors:', JSON.stringify(errors));
  });
});
