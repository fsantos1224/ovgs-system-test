import { test, expect } from '@playwright/test';

test.describe('OV Creation — happy path', () => {
  test('admin pode criar OV end-to-end', async ({ page }) => {
    // Login como admin (RBAC já permite criar OV)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ovgs:role', 'admin');
      localStorage.setItem(
        'ovgs:user',
        JSON.stringify({ email: 'admin@ovgs.local', role: 'admin', nome: 'Administrador' }),
      );
    });

    await page.goto('/ovs/nova');
    await expect(page.getByRole('heading', { name: 'Nova Ordem de Venda' })).toBeVisible();

    // Cliente Alpha (id "1") — autorizado [1, 3]. Transporte "1" é permitido.
    await page.locator('select[name="clienteId"]').selectOption('1');

    // Após escolher cliente, dropdown de transporte fica habilitado e filtra
    await expect(page.locator('select[name="transporteId"]')).toBeEnabled();
    await page.locator('select[name="transporteId"]').selectOption('1');

    await page.locator('input[name="dataEntrega"]').fill('2026-12-31');

    // Primeiro item já existe por default; selecionar Parafuso M10 (id "1")
    await page.locator('select[name="itens.0.itemId"]').selectOption('1');
    await page.locator('input[name="itens.0.quantidade"]').fill('100');

    await page.getByRole('button', { name: 'Criar Ordem' }).click();

    // Após criar, redireciona para /ovs com a OV visível na lista
    await page.waitForURL(/\/ovs$/);
    await expect(page.getByText(/OV-\d+/).first()).toBeVisible();
  });

  test('transporte não autorizado para cliente aparece bloqueado', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ovgs:role', 'admin');
      localStorage.setItem(
        'ovgs:user',
        JSON.stringify({ email: 'admin@ovgs.local', role: 'admin', nome: 'Administrador' }),
      );
    });

    await page.goto('/ovs/nova');
    // Beta (id "2") — só autorizado [2]. Após selecionar, dropdown de
    // transporte mostra "Selecione..." + apenas o id 2.
    await page.locator('select[name="clienteId"]').selectOption('2');
    const transporteSelect = page.locator('select[name="transporteId"]');
    await expect(transporteSelect).toBeEnabled();
    const options = await transporteSelect.locator('option').allTextContents();
    // Deve ter apenas o transporte "LogExpress Aéreo" (id 2) como opção real
    expect(options.some((o) => o.includes('LogExpress'))).toBe(true);
    // Transporte rodoviário (id 1) NÃO deve aparecer
    expect(options.some((o) => o.includes('Transportadora Rápida'))).toBe(false);
  });
});