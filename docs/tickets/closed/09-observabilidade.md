# Ticket 9 — Observabilidade: Performance Observer nativo

- **Tipo:** `wayfinder:research`
- **Bloqueado por:** Ticket 1 — Stack Frontend

## Questão

Como implementar observabilidade básica (métricas de performance e eventos de negócio) usando **apenas APIs nativas do browser** — sem PostHog, Vercel Analytics, Datadog ou libs externas?

## Restrições YAGNI

- `🐴` Performance Observer nativo: 3 linhas, sem libs
- `🐴` Eventos de negócio: console.log estruturado + localStorage para persistência simples
- Nada de serviços externos (PostHog, GA, etc.) — o sistema é backoffice interno

## O que precisa de ser decidido

- Quais métricas de performance coletar (LCP, CLS, INP, TTFB)
- Quais eventos de negócio rastrear (criação de OV, mudança de status, agendamento, erro de permissão)
- Onde armazenar os eventos (localStorage? console.table para dev?)
- Como expor métricas ao avaliador (interface de dev/debug? console?)
- Padrão de logging estruturado (timestamp, action, entity, user, metadata)

## Exemplo de output esperado (ponytail)

```typescript
// 🐴: performance monitoring — 3 linhas, nativo do browser
new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log('[WebVital]', entry.name, entry.value, entry.rating);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });

// 🐴: business events — console estruturado, sem SDK
const trackEvent = (action: string, entity: string, details?: Record<string, unknown>) => {
  const event = { timestamp: new Date().toISOString(), action, entity, details };
  console.table([event]); // visível no DevTools
};
```

## Resolução

*[a preencher quando resolvido]*