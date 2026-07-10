# Ticket 43 — Clientes, Transportes, Itens, Auditoria: Ports + repositórios + migração

**Tipo:** `wayfinder:feature`

**Bloqueado por:** 40, 41 (precisa dos tipos de domínio limpos + DTOs + ApiClient)

## O que construir

Aplicar o mesmo padrão do ticket 42 para as entidades restantes: Cliente, TipoTransporte, Item, EventoAuditoria.

### Ports

- `IClienteRepository` — listar, obterPorId, criar, atualizar, excluir
- `IItemRepository` — listar, criar, atualizar, excluir
- `ITransporteRepository` — listar, criar, atualizar, excluir
- `IAuditoriaRepository` — listar (read-only)

### Implementações concretas

- `ClienteRepository`, `ItemRepository`, `TransporteRepository`, `AuditoriaRepository` em `infrastructure/repositories/`

### Migração

- `useClientes.ts`, `useItens.ts`, `useTransportes.ts`, `useAuditoria.ts` migrados para usar os respectivos repositórios
- Mutations tipadas com DTOs

## Critérios de aceitação

- [x] 4 interfaces de repositório criadas em `application/ports/`
- [x] 4 implementações concretas em `infrastructure/repositories/`
- [x] Hooks migrados — mutations tipadas
- [x] CRUD de clientes, transportes, itens + listagem de auditoria funcionam
- [x] `tsc --noEmit` + `vitest run` (39/39) + `build` verdes

## Resolução

- 4 ports criadas: `IClienteRepository`, `IItemRepository`, `ITransporteRepository`, `IAuditoriaRepository` em `application/ports/`
- 4 implementações concretas em `infrastructure/repositories/`: `ClienteRepository`, `ItemRepository`, `TransporteRepository`, `AuditoriaRepository`
- Hooks migrados: `useClientes.ts`, `useItens.ts`, `useTransportes.ts`, `useAuditoria.ts` — todos com singleton module-level do repository
- `useEventosAuditoria` mantido como alias de `useAuditoria` para compatibilidade
- `EventoAuditoria.estadoAnterior`/`estadoPosterior` ajustados para opcionais (alinhamento com Zod `.nullish()`)
- `tsc --noEmit`, `vitest run`, `npm run build` verificados
