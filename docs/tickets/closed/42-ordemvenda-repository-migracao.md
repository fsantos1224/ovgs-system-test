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

- [x] `IOrdemVendaRepository` criado em `application/ports/`
- [x] `OrdemVendaRepository` implementado em `infrastructure/repositories/`
- [x] `useOrdensVenda.ts` migrado — mutations usam repository
- [x] Listagem, criação, detalhe, alteração de status, exclusão funcionam (E2E)
- [x] `tsc --noEmit` + `vitest run` (39/39) + `build` verdes

## Resolução

- `IOrdemVendaRepository` em `application/ports/IOrdemVendaRepository.ts` com métodos: `listar`, `obterPorId`, `criar` (com suporte a `extraHeaders`), `atualizar`, `alterarStatus`, `excluir`
- `CriarOVPayload = Omit<OrdemVenda, "id">` exportado da port
- `OrdemVendaRepository` em `infrastructure/repositories/` — implementa a port usando `api.ts` helpers
- `useOrdensVenda.ts` migrado — instancia `OrdemVendaRepository` via singleton module-level, chamadas delegadas ao repository
- `useAlterarStatusOV` alterada de `{ id, data: { status } }` para `{ id, status }` (interface mais limpa)
- `OrdemVenda` entity ajustada: `observacoes` e `janelaAtendimento` passaram a opcionais (`?: string | null`) para alinhar com Zod `.nullish()`
- `tsc --noEmit`, `vitest run`, `npm run build` verificados
