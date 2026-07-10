import { test, expect } from "@playwright/test";

// IDs carregados via API no beforeAll — sem hardcoded
let alphaId: string;
let alphaTransporteId: string;
let itemId: string;
let betaId: string;

async function loginAdmin(page: any) {
  await page.goto("/");
  await page.evaluate(() => {
    (window as any).__login("admin@XPTO.local", "admin123");
  });
  await page.reload();
}

test.describe("OV Creation — happy path", () => {
  test.beforeAll(async ({ request }) => {
    const [clientes, transportes, itens] = await Promise.all([
      request.get("/api/clientes"),
      request.get("/api/tiposTransporte"),
      request.get("/api/itens"),
    ]).then(([c, t, i]) => Promise.all([c.json(), t.json(), i.json()]));
    const alpha = clientes.find((c: { nome: string }) =>
      c.nome.startsWith("Empresa Alpha"),
    );
    const beta = clientes.find((c: { nome: string }) =>
      c.nome.startsWith("Beta"),
    );
    alphaId = alpha.id;
    alphaTransporteId = alpha.transportesAutorizados[0];
    betaId = beta.id;
    itemId = itens.find((i: { ativo: boolean }) => i.ativo).id;
  });

  test("admin pode criar OV end-to-end", async ({ page }) => {
    await loginAdmin(page);

    await page.goto("/ovs/nova");
    await expect(
      page.getByRole("heading", { name: "Nova Ordem de Venda" }),
    ).toBeVisible();

    await page.locator('select[name="clienteId"]').selectOption(alphaId);

    await expect(page.locator('select[name="transporteId"]')).toBeEnabled();
    await page.locator('select[name="transporteId"]').selectOption(alphaTransporteId);

    await page.locator('input[name="dataEntregaPrevista"]').fill("2026-12-31");

    await page.locator('select[name="itens.0.itemId"]').selectOption(itemId);
    await page.locator('input[name="itens.0.quantidade"]').fill("100");

    await page.getByRole("button", { name: "Criar Ordem" }).click();

    await page.waitForURL(/\/ovs$/);
    await expect(page.getByText(/OV-\d+/).first()).toBeVisible();
  });

  test("transporte não autorizado para cliente aparece bloqueado", async ({
    page,
  }) => {
    await loginAdmin(page);

    await page.goto("/ovs/nova");
    await page.locator('select[name="clienteId"]').selectOption(betaId);
    const transporteSelect = page.locator('select[name="transporteId"]');
    await expect(transporteSelect).toBeEnabled();
    const options = await transporteSelect.locator("option").allTextContents();
    expect(options.some((o) => o.includes("LogExpress"))).toBe(true);
    expect(options.some((o) => o.includes("Transportadora Rápida"))).toBe(
      false,
    );
  });
});
