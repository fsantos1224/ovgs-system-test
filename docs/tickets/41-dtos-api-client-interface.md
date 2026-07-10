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

- [ ] `src/application/ports/DTOs.ts` com todos os DTOs listados
- [ ] `src/application/ports/IApiClient.ts` com interface genérica
- [ ] Tipos DTO usados em mutations (não mais `Record<string, unknown>`)
- [ ] `tsc --noEmit` limpo
