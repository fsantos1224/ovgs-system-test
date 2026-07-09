import { test, expect } from "@playwright/test";

test.describe("OV Detail", () => {
  test("carrega detalhes de uma OV existente", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on("pageerror", (err) => logs.push(`PAGEERROR: ${err.message}`));

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

    await page.goto("/ovs/1");
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(1000);

    // Debug
    await page.screenshot({ path: "/tmp/XPTO-ov1.png" });
    const html = await page.locator("html").innerHTML();
    console.log("HTML snippet:", html.substring(0, 500));
    console.log(
      "Logs:",
      logs
        .filter(
          (l) =>
            l.startsWith("PAGEERROR") ||
            l.includes("error") ||
            l.includes("Error"),
        )
        .join("\n"),
    );

    // Deve mostrar o número da OV
    await expect(page.getByText("OV-2024-0001")).toBeVisible({ timeout: 3000 });
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

    await page.goto("/ovs/999");
    await page.waitForLoadState("domcontentloaded").catch(() => {});

    await expect(page.getByText("Ordem de venda não encontrada")).toBeVisible();
  });
});
