import { test, expect } from "@playwright/test";

test.describe("OV Detail", () => {
  test("carrega detalhes de uma OV existente", async ({ page, request }) => {
    // Pega o UUID + numero de uma OV real do seed
    const ov = await request.get("/api/ordensVenda").then((r) => r.json()).then((arr: Array<{id:string; numero:string}>) => arr[0]);
    const ovId = ov.id;
    const ovNumero = ov.numero;

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

    await page.goto(`/ovs/${ovId}`);
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    // Deve mostrar o número da OV carregada
    await expect(page.getByText(ovNumero)).toBeVisible({ timeout: 5000 });
  });

  test("mostra 404 para OV inexistente", async ({ page }) => {
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

    await page.goto("/ovs/00000000-0000-4000-8000-000000000000");
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    await expect(page.getByText("Ordem de venda não encontrada")).toBeVisible();
  });
});
