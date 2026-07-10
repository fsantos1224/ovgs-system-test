# Ticket 42 — OrdemVenda: Repository ports + concreto + migração

**Tipo:** `wayfinder:feature`

**Bloqueado por:** 40, 41 (precisa dos tipos de domínio limpos + DTOs + ApiClient)

## O que construir

Criar a interface de repositório de OrdemVenda (`IOrdemVendaRepository`) como port na camada de aplicação, e sua implementação concreta em infraestrutura. Migrar o hook `useOrdensVenda.ts` para usar o repository.

### Port

- `IOrdemVendaRepository` em `application/ports/` com métodos:
  - `listar(params: ListarOVParams): Promise<PaginatedResult<OrdemVenda>>`
  - `obterPorId(id: string): Promise<OrdemVenda>`
  - `criar(dto: CriarOVDTO): Promise<OrdemVenda>`
  - `atualizar(id: string, dto: AtualizarOVDTO): Promise<OrdemVenda>`
  - `alterarStatus(id: string, status: string): Promise<OrdemVenda>`
  - `excluir(id: string): Promise<void>`

### Implementação concreta

- `OrdemVendaRepository` em `infrastructure/repositories/` — implementa a port usando `ApiClient` (ou diretamente os helpers do `api.ts`)

### Migração

- `useOrdensVenda.ts` passa a receber/instanciar o repository
- Mutations tipadas com DTOs (sem `Record<string, unknown>`)
- Side-effect de toast permanece nos hooks de mutation (não sobe para use case ainda)

### Testes

- Teste de integração do `OrdemVendaRepository` contra o json-server
- Teste unitário do hook com repository mockado

## Critérios de aceitação

- [ ] `IOrdemVendaRepository` criado em `application/ports/`
- [ ] `OrdemVendaRepository` implementado em `infrastructure/repositories/`
- [ ] `useOrdensVenda.ts` migrado — mutations tipadas, sem `Record<string, unknown>`
- [ ] Listagem, criação, detalhe, alteração de status, exclusão funcionam (E2E)
- [ ] Testes de integração do repository
- [ ] `tsc --noEmit` + `vitest run` verdes
