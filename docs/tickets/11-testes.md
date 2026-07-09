# Ticket 11 — Testes: Vitest + Playwright

- **Tipo:** `wayfinder:grilling`
- **Bloqueado por:** Ticket 2 — Mock json-server, Ticket 4 — Estado + fetch, Ticket 6 — RBAC

## Questão

Qual a estratégia de testes (unitários + E2E) para cobrir cenários críticos de negócio, usando **apenas Vitest + Playwright** — sem RTL, sem Testing Library?

## Restrições YAGNI

- `🐴` Vitest (unit + render) para lógica de negócio pura (funções de validação, transição de status, RBAC)
- `🐴` Playwright para E2E (fluxo completo de criação de OV, agendamento, teste de permissões)
- Sem RTL, sem Testing Library — Playwright tem `page.getByRole()` nativo
- Mínimo: 2 testes unitários + 1 E2E (requisito do desafio), ideal: cobrir cenários críticos

## Cenários mínimos esperados

- Unit: `canTransition('CRIADA', 'PLANEJADA') === true`
- Unit: `canTransition('CRIADA', 'ENTREGUE') === false` (pula estados)
- Unit: `usePermission().can('create_ov', 'viewer') === false`
- E2E: Login como operator → criar OV → verificar status → tentar agendar (erro? permitido?)
- E2E: Login como viewer → tentar criar OV → verificar que botão não existe ou é desativado

## Notas

- Playwright + json-server: `playwright.config.ts` com `webServer` para levantar json-server antes dos testes
- Vitest: testes unitários sem mock de network (funções puras)

## Resolução

*[a preencher quando resolvido]*