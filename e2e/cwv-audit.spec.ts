import { test, expect } from "@playwright/test";

const CWV_THRESHOLDS = {
  "LCP": { good: 2500, poor: 4000 },
  "FCP": { good: 1800, poor: 3000 },
  "CLS": { good: 0.1, poor: 0.25 },
  "INP": { good: 200, poor: 500 },
  "TTFB": { good: 800, poor: 1800 },
};

const ROTAS = [
  { path: "/", label: "Dashboard" },
  { path: "/ovs", label: "OV List" },
  { path: "/ovs/nova", label: "OV New" },
  { path: "/ovs/30a6a90c-9e25-4baa-8d5e-b9ef4b58843b", label: "OV Detail" },
  { path: "/agendamento", label: "Agendamento" },
  { path: "/cadastros/clientes", label: "Clientes" },
  { path: "/cadastros/transportes", label: "Transportes" },
  { path: "/cadastros/itens", label: "Itens" },
  { path: "/auditoria", label: "Auditoria" },
];

async function collectMetrics(page: any) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as any;
    const paint = performance.getEntriesByType("paint");
    const fcp = paint.find((e: any) => e.name === "first-contentful-paint");

    const metrics: Record<string, number> = {
      TTFB: nav?.responseStart ?? 0,
      FCP: (fcp as any)?.startTime ?? 0,
      DomContentLoaded: nav?.domContentLoadedEventEnd ?? 0,
      Load: nav?.loadEventEnd ?? 0,
    };

    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      metrics.LCP = (last?.renderTime ?? last?.loadTime ?? last?.startTime) ?? 0;
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });

    const clsObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) metrics.CLS = (metrics.CLS ?? 0) + entry.value;
      }
    });
    clsObs.observe({ type: "layout-shift", buffered: true });

    return new Promise((resolve) => {
      setTimeout(() => {
        lcpObs.disconnect();
        clsObs.disconnect();
        resolve(metrics);
      }, 3000);
    });
  });
}

function rating(name: string, value: number): string {
  const t = CWV_THRESHOLDS[name as keyof typeof CWV_THRESHOLDS];
  if (!t) return "—";
  if (value === 0) return "⚪ sem dados";
  if (value <= t.good) return "🟢 bom";
  if (value <= t.poor) return "🟡 precisa melhorar";
  return "🔴 ruim";
}

test.describe("Core Web Vitals — auditoria de performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      (window as any).__login("admin@XPTO.local", "admin123");
    });
  });

  for (const rota of ROTAS) {
    test(`${rota.label} (${rota.path})`, async ({ page }) => {
      await page.goto(rota.path);
      await page.waitForLoadState("networkidle");

      const metrics = await collectMetrics(page);

      const report = [
        `\n  ── Core Web Vitals — ${rota.label} ──`,
        `  LCP:   ${(metrics.LCP ?? 0).toFixed(0)}ms  ${rating("LCP", metrics.LCP ?? 0)}`,
        `  FCP:   ${(metrics.FCP ?? 0).toFixed(0)}ms  ${rating("FCP", metrics.FCP ?? 0)}`,
        `  CLS:   ${(metrics.CLS ?? 0).toFixed(3)}   ${rating("CLS", metrics.CLS ?? 0)}`,
        `  INP:   ${(metrics.INP ?? 0).toFixed(0)}ms  ${rating("INP", metrics.INP ?? 0)}`,
        `  TTFB:  ${(metrics.TTFB ?? 0).toFixed(0)}ms  ${rating("TTFB", metrics.TTFB ?? 0)}`,
        `  ───────────────────────────────`,
      ].join("\n");

      console.log(report);
      test.info().annotations.push({
        type: "metrics",
        description: report,
      });

      // Fails only if LCP > 4000ms or CLS > 0.25 — o resto é informativo
      expect(metrics.LCP ?? 0).toBeLessThan(4000);
      expect(metrics.CLS ?? 0).toBeLessThan(0.25);
      expect(metrics.TTFB ?? 0).toBeLessThan(3000);
    });
  }
});
