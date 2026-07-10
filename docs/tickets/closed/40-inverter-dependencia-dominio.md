# Ticket 40 — Prefactor: Inverter dependência do domínio (expand-contract)

**Tipo:** `wayfinder:refactor` (wide — expand-contract)

**Bloqueado por:** Nenhum — pode começar imediatamente.

## O que construir

O domínio atualmente reexporta tipos dos schemas Zod (`export type Cliente = ClienteResponse`). Isso cria uma dependência inversa: o domínio (camada mais interna) depende de schemas (detalhe de infraestrutura). Este ticket inverte essa relação.

**Expand:** Criar `src/domain/entities/` com interfaces TypeScript puras para cada entidade do domínio, sem qualquer dependência de Zod ou schemas. As interfaces espelham exatamente o shape atual das responses.

**Contract:** Atualizar `src/domain/types.ts` para importar de `domain/entities/`. Ajustar schemas Zod em `src/schemas/` para definirem seus próprios shapes (sem inferir dos tipos de domínio). Remover os re-exports de schemas do `domain/types.ts` quando nenhum consumer mais os usar.

Nenhuma mudança de comportamento — é puramente estrutural. TypeScript structural typing garante que consumers não quebrem enquanto os shapes forem idênticos.

## Critérios de aceitação

- [ ] `src/domain/entities/OrdemVenda.ts` — interface `OrdemVenda` pura (sem Zod)
- [ ] `src/domain/entities/Cliente.ts` — interface `Cliente` pura
- [ ] `src/domain/entities/Item.ts` — interface `Item` pura
- [ ] `src/domain/entities/TipoTransporte.ts` — interface `TipoTransporte` pura
- [ ] `src/domain/entities/EventoAuditoria.ts` — interface `EventoAuditoria` pura
- [ ] `src/domain/entities/OVStatus.ts` — tipo `OVStatus` + funções puras `canTransition`, `statusLabel` (movidas de `types.ts`)
- [ ] Schemas Zod em `schemas/` continuam definindo seus próprios shapes (independentes)
- [ ] `domain/types.ts` reexporta de `domain/entities/`, não mais de `schemas/`
- [x] `tsc --noEmit` limpo
- [x] `vitest run` — todos os testes passam (nenhum muda de comportamento)

## Resolução

Criados 5 arquivos em `src/domain/entities/` com interfaces TypeScript puras (sem Zod):

- `OrdemVenda.ts` — interfaces `OrdemVenda`, `ItemOV`, tipo `OVStatus`, constant `STATUS_FLOW`, funções `canTransition()` e `statusLabel()`
- `Cliente.ts` — interface `Cliente` e função `canUseTransporte()`
- `Item.ts` — interface `Item`
- `TipoTransporte.ts` — interface `TipoTransporte`
- `EventoAuditoria.ts` — interface `EventoAuditoria`

`src/domain/types.ts` reescrito para reexportar de `domain/entities/` em vez de `schemas/`. Mantidos `Usuario` e `UserRole` (não têm equivalente em schema).

Nenhum consumer quebrou — structural typing do TS absorveu todas as mudanças. `tsc --noEmit`, `vitest run` (39/39) e `npm run build` verificados.
