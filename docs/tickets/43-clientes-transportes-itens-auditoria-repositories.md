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

- [ ] 4 interfaces de repositório criadas em `application/ports/`
- [ ] 4 implementações concretas em `infrastructure/repositories/`
- [ ] Hooks migrados — mutations tipadas
- [ ] CRUD de clientes, transportes, itens + listagem de auditoria funcionam
- [ ] Testes de integração dos repositórios
- [ ] `tsc --noEmit` + `vitest run` verdes
