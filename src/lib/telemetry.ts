// Observabilidade: Performance Observer nativo conforme W3C para LCP/CLS/INP.
// Zero dependências. Zero SDKs. Zero serviços externos.
//
// Métricas são persistidas em localStorage no formato
// { name, value, id, ts } e ficam inspecionáveis no DevTools.

interface VitalRecord {
  name: "LCP" | "CLS" | "INP";
  value: number;
  id?: string;
  ts: number;
}

const VITALS_KEY = "ovgs:vitals";
const VITALS_MAX = 100;

function recordVital(v: VitalRecord) {
  try {
    const history = JSON.parse(localStorage.getItem(VITALS_KEY) ?? "[]");
    history.push(v);
    if (history.length > VITALS_MAX) history.shift();
    localStorage.setItem(VITALS_KEY, JSON.stringify(history));
  } catch {
    /* localStorage indisponível */
  }
}

function readVitals(): VitalRecord[] {
  try {
    return JSON.parse(localStorage.getItem(VITALS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function initWebVitals() {
  let lcpValue = 0;
  let lcpId: string | undefined;
  let clsValue = 0;
  const inpInteractions = new Map<number, number>();

  // LCP — Largest Contentful Paint
  // Spec W3C: reportar o MAIOR entry. Em alguns browsers o entry final é
  // emitido após interação do usuário, então também escutamos
  // `visibilitychange`/`pagehide` para "fechar" o valor.
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
        id?: string;
      };
      const value = last.renderTime ?? last.loadTime ?? last.startTime;
      if (value > lcpValue) {
        lcpValue = value;
        lcpId = last.id;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });

    const finalizeLCP = () => {
      if (lcpValue > 0) {
        recordVital({ name: "LCP", value: lcpValue, id: lcpId, ts: Date.now() });
      }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finalizeLCP();
    });
    window.addEventListener("pagehide", finalizeLCP);
  } catch {
    /* browser sem suporte */
  }

  // CLS — Cumulative Layout Shift
  // Spec W3C: somar `value` apenas de entries com `hadRecentInput === false`.
  // Sessão termina em `visibilitychange === hidden` ou `hidden` antes do unload.
  try {
    let clsSessionValue = 0;
    let clsSessionStart = performance.now();
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (entry.hadRecentInput) continue;
        clsSessionValue += entry.value;
      }
      if (clsSessionValue > clsValue) clsValue = clsSessionValue;
    }).observe({ type: "layout-shift", buffered: true });

    const finalizeCLS = () => {
      if (clsValue > 0) {
        recordVital({ name: "CLS", value: clsValue, ts: Date.now() });
      }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finalizeCLS();
    });
    window.addEventListener("pagehide", finalizeCLS);
    void clsSessionStart;
  } catch {
    /* browser sem suporte */
  }

  // INP — Interaction to Next Paint
  // Spec W3C: observar `event` com durationThreshold 16ms, manter janela
  // rolante das piores interações (pior das 4 últimas OU duração >= 200ms
  // recente). Reportar a maior duração de interactionId agrupado.
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & {
        duration: number;
        interactionId?: number;
      }>) {
        if (entry.interactionId == null) continue;
        const prev = inpInteractions.get(entry.interactionId) ?? 0;
        if (entry.duration > prev) {
          inpInteractions.set(entry.interactionId, entry.duration);
        }
      }
    }).observe({ type: "event", buffered: true } as PerformanceObserverInit);

    const finalizeINP = () => {
      const durations = [...inpInteractions.values()].sort((a, b) => b - a);
      const top = durations.slice(0, 4);
      if (top.length === 0) return;
      const worst = Math.max(...top);
      recordVital({ name: "INP", value: worst, ts: Date.now() });
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finalizeINP();
    });
    window.addEventListener("pagehide", finalizeINP);
  } catch {
    /* browser sem suporte */
  }
}

export function getVitals(): VitalRecord[] {
  return readVitals();
}

// Eventos de negócio — persistidos em localStorage com bounded buffer.

const STORAGE_KEY = "ovgs:events";

export function trackEvent(
  action: string,
  entity: string,
  details?: Record<string, unknown>,
) {
  const event = {
    timestamp: new Date().toISOString(),
    action,
    entity,
    usuario: (() => { try { return JSON.parse(localStorage.getItem("ovgs:user") ?? "{}").email || "desconhecido"; } catch { return "desconhecido"; } })(),
    details,
  };

  console.table([event]);

  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    history.push(event);
    if (history.length > 100) history.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* localStorage indisponível */
  }
}