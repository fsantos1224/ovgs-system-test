// 🐴 Observabilidade: Performance Observer nativo + eventos de negócio em console.table.
// Zero dependências. Zero SDKs. Zero serviços externos.

const STORAGE_KEY = 'ovgs:events';

export function initWebVitals() {
  // 🐴 LCP — Largest Contentful Paint
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('[WebVital] LCP', (entry as PerformanceEntry & { renderTime?: number }).renderTime ?? entry.startTime, 'ms');
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* browser sem suporte */ }

  // 🐴 CLS — Cumulative Layout Shift
  try {
    new PerformanceObserver((list) => {
      let cls = 0;
      for (const entry of list.getEntries()) {
        cls += (entry as PerformanceEntry & { value: number }).value;
      }
      console.log('[WebVital] CLS', cls.toFixed(3));
    }).observe({ type: 'layout-shift', buffered: true });
  } catch { /* browser sem suporte */ }

  // 🐴 INP — Interaction to Next Paint
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('[WebVital] INP', (entry as PerformanceEntry & { duration: number }).duration, 'ms');
      }
    }).observe({ type: 'first-input', buffered: true });
  } catch { /* browser sem suporte */ }
}

export function trackEvent(action: string, entity: string, details?: Record<string, unknown>) {
  const event = {
    timestamp: new Date().toISOString(),
    action,
    entity,
    usuario: localStorage.getItem('ovgs:user') ?? 'desconhecido',
    details,
  };

  // 🐴 DevTools log — visível imediatamente
  console.table([event]);

  // 🐴 Persistência em localStorage — histórico para auditoria/debug
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    history.push(event);
    if (history.length > 100) history.shift(); // mantém últimos 100 eventos
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch { /* localStorage cheio ou indisponível */ }
}
