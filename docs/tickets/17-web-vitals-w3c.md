# Ticket 17 — Web Vitals conforme spec W3C

- **Tipo:** `wayfinder:quality`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

O `src/lib/telemetry.ts` declara "Performance Observer nativo para LCP/CLS/INP", mas a implementação atual mede errado:

| Métrica | O que o código diz | O que faz |
|---|---|---|
| LCP | `largest-contentful-paint` observer | Loga **toda entrada**, não a final |
| CLS | `layout-shift` observer | Loga toda entrada, ignora `hadRecentInput` |
| INP | "INP" | Observa `first-input`, que é a API legada do FID |

Além disso, nada é persistido — vai só pro console. A README ainda afirma "PerformanceObserver nativo para LCP/CLS/INP", o que é falso hoje.

## Restrições YAGNI

- `🐴` Sem dependência nova (`web-vitals` lib é tentador, mas o spec W3C cabe em ~50 linhas)
- `🐴` Reusar o buffer bounded de `trackEvent` em `localStorage` para inspeção no DevTools

## Cenários de aceitação

- [ ] LCP reporta o **último** `largest-contentful-paint` entry no callback de `visibilitychange` (document.hidden) ou `pagehide`
- [ ] CLS soma apenas entries com `hadRecentInput === false`
- [ ] INP observa `event` com `durationThreshold: 16` e reporta o maior `duration` da janela de interação
- [ ] As 3 métricas persistem no `localStorage` no formato `{ name, value, id, ts }` com cap de 100 entradas
- [ ] README atualizado para refletir o que o observer realmente mede (sem claim falso)
- [ ] Doc drift corrigido no `MAP.md` ao final

## Notas

- Referência W3C: https://web.dev/articles/lcp, https://web.dev/articles/cls, https://web.dev/articles/inp
- O cálculo "max INP da janela" precisa de uma janela rolante (4 interações recentes ou 5 segundos, o que for maior) — implementar isso é o ponto mais sutil.
- `pagehide` é mais confiável que `beforeunload` em mobile.

## Resolução

_a preencher ao fechar o ticket_