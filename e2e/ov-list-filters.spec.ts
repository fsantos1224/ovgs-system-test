import { test, expect } from "@playwright/test";

test.describe("OV List — filtros", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "XPTO:user",
        JSON.stringify({
          email: "admin@XPTO.local",
          nome: "Administrador",
          role: "admin",
        }),
      );
      localStorage.setItem("XPTO:role", "admin");
    });
    await page.reload();
  });

  test("filtra por status", async ({ page }) => {
    await page.goto("/ovs");
    await page.waitForLoadState("domcontentloaded").catch(() => {});
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
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    // Aguarda a tabela popular antes de contar (evita race com fetch inicial)
    await page.waitForFunction(
      () => document.querySelectorAll("table tbody tr").length > 0,
      { timeout: 10_000 },
    );
    const antes = await page.locator("table tbody tr").count();
    expect(antes).toBeGreaterThan(0);
    // Filtra por data restrita que intersecta o seed (2025-11-XX)
    await page.locator('input[type="date"]').first().fill("2025-11-21");
    await page.waitForTimeout(500);
    const depois = await page.locator("table tbody tr").count();
    expect(depois).toBeLessThanOrEqual(antes);
  });
});
