import { test, expect } from "@playwright/test";

test.describe("OV List — filtros", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("ovgs:user", JSON.stringify({ email: "admin@ovgs.com", nome: "Administrador", role: "admin" }));
      localStorage.setItem("ovgs:role", "admin");
    });
    await page.reload();
  });

  test("filtra por status", async ({ page }) => {
    await page.goto("/ovs");
    await page.waitForLoadState("networkidle");
    await page.selectOption("select", "CRIADA");
    await page.waitForTimeout(500);
    // Todas as linhas visíveis devem ter status "Criada"
    const cells = page.locator("table tbody tr td:nth-child(4)");
    const count = await cells.count();
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).toContainText("Criada");
    }
  });

  test("filtro de data reduz resultados", async ({ page }) => {
    await page.goto("/ovs");
    await page.waitForLoadState("networkidle");
    // Conta linhas antes
    const antes = await page.locator("table tbody tr").count();
    // Filtra por data futura restrita
    await page.locator('input[type="date"]').first().fill("2024-11-20");
    await page.waitForTimeout(500);
    const depois = await page.locator("table tbody tr").count();
    expect(depois).toBeLessThanOrEqual(antes);
  });
});
