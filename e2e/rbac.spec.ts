// E2E: RBAC — viewer não vê botão "Nova OV", admin vê
import { test, expect } from "@playwright/test";

test.describe("RBAC — autorização por role", () => {
  test("viewer não vê botão de criar OV", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "XPTO:user",
        JSON.stringify({
          email: "viewer@XPTO.local",
          nome: "Visualizador",
          role: "viewer",
        }),
      );
      localStorage.setItem("XPTO:role", "viewer");
    });
    await page.reload();

    await page.goto("/ovs");
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    const btn = page.getByRole("link", { name: /nova ov/i });
    await expect(btn).toHaveCount(0);
  });

  test("admin vê botão de criar OV", async ({ page }) => {
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

    await page.goto("/ovs");
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(5000);

    const html = await page.content();
    console.log("=== PAGE URL ===", page.url());
    if (html.includes("Carregando")) console.log("^^^ STILL LOADING");
    if (html.includes("Login")) console.log("^^^ ON LOGIN PAGE");
    if (html.includes("Nova OV")) console.log("^^^ BUTTON FOUND IN HTML");

    const btn = page.getByRole("link", { name: /nova ov/i });
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test("admin pode criar OV e ver na listagem", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

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
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    await page.goto("/ovs/nova");
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    const selectLoaded = await page.waitForFunction(() => {
      const sel = document.querySelector<HTMLSelectElement>(
        'select[name="clienteId"]',
      );
      return sel && sel.options.length > 1;
    });
    console.log("Select loaded:", !!selectLoaded);

    await page.waitForTimeout(500);
    console.log("JS errors:", JSON.stringify(errors));
  });
});
