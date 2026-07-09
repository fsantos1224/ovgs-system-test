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

### Decisão

- `🐴` **Vitest** para lógica de domínio pura (6 testes unitários em `src/domain/types.test.ts`)
- `🐴` **Playwright** para E2E com `webServer` (json-server + Vite) em `playwright.config.ts`
- Sem RTL, sem Testing Library — Playwright `getByRole` nativo
- Sem testes de hook/componente — cobertura via E2E
- Mínimo do desafio (2 unit + 1 E2E) excedido (6 unit + 3 E2E)

### Cobertura implementada

**Unitários (6):**
- `canTransition('CRIADA', 'PLANEJADA') === true`
- `canTransition('CRIADA', 'ENTREGUE') === false`
- Transições completas até ENTREGUE
- Estado final rejeita transições
- Mesmo estado rejeitado
- `statusLabel()` retorna label em português

**E2E (3):**
- Viewer não vê botão "Nova OV"
- Admin vê botão "Nova OV"
- Formulário de criação carrega sem erros JS

### Problema conhecido

- Submissão do formulário React Hook Form via Playwright não navega (`handleSubmit` não reconhece eventos sintéticos)
- Contorno: API testada diretamente (funciona), form load testado sem erros
- Para resolver: investigar `register` + eventos nativos do React 18