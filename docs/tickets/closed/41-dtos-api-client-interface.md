# Ticket 41 — DTOs base + API Client interface

**Tipo:** `wayfinder:feature`

**Bloqueado por:** 40 (precisa dos tipos de domínio limpos para definir DTOs)

## O que construir

Formalizar os DTOs de entrada/saída que estavam implícitos nos schemas de formulário e response. Criar a interface do cliente HTTP como porta (port) da camada de aplicação.

### DTOs

- `CriarOVDTO` — o que o frontend envia ao criar uma OV (substitui `Record<string, unknown>`)
- `AtualizarOVDTO` — o que pode ser alterado via PATCH
- `ListarOVParams` — parâmetros de query para listagem paginada + filtros
- `CriarClienteDTO`, `AtualizarClienteDTO`
- `CriarItemDTO`, `AtualizarItemDTO`
- `CriarTransporteDTO`, `AtualizarTransporteDTO`
- `PaginatedResult<T>` — genérico para resultados paginados

### API Client Interface

- `IApiClient` em `application/ports/` com métodos tipados:
  - `get<T>(path): Promise<T>`
  - `getPaginated<T>(path): Promise<PaginatedResult<T>>`
  - `post<T,B>(path, body): Promise<T>`
  - `patch<T,B>(path, body): Promise<T>`
  - `delete(path): Promise<void>`

### Resolução

```typescript
// Exemplo de decisão registrada
// DTOs de entrada (command) usam tipos planos, sem Zod.
// A validação de fronteira (Zod schemas) acontece dentro da implementação concreta do ApiClient.
// DTOs não substituem schemas — são os contratos que o use case/repository espera.
```

## Critérios de aceitação

- [x] `src/application/ports/DTOs.ts` com todos os DTOs listados
- [x] `src/application/ports/IApiClient.ts` com interface genérica
- [x] Tipos DTO usados em mutations (não mais `Record<string, unknown>`)
- [x] `tsc --noEmit` limpo

## Resolução

`src/application/ports/` criado com:

- `DTOs.ts` — interfaces `CriarOVDTO`, `AtualizarOVDTO`, `ListarOVParams`, `CriarClienteDTO`, `AtualizarClienteDTO`, `CriarItemDTO`, `AtualizarItemDTO`, `CriarTransporteDTO`, `AtualizarTransporteDTO`, `PaginatedResult<T>`
- `IApiClient.ts` — interface genérica com métodos `get`, `getPaginated`, `post`, `patch`, `delete`

Mutations nos hooks de query atualizadas para usar DTOs:

- `useOrdensVenda.ts` — `ListarOVParams`, `AtualizarOVDTO`, `Pick<AtualizarOVDTO, "status">`; tipo export `CriarOVPayload` para o payload completo
- `useClientes.ts` — `CriarClienteDTO`, `AtualizarClienteDTO`
- `useItens.ts` — `CriarItemDTO`, `AtualizarItemDTO`
- `useTransportes.ts` — `CriarTransporteDTO`, `AtualizarTransporteDTO`
- Cast `as unknown as Record<string, unknown>` removido em `Itens.tsx`
- `Record<string, string>` trocado por `AtualizarOVDTO` em `Agendamento.tsx`

`tsc --noEmit`, `vitest run` (39/39) verificados.
