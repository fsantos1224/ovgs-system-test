# Ticket 44 — Use case: CriarOrdemVenda + AlterarStatusOV

**Tipo:** `wayfinder:feature`

**Bloqueado por:** 42 (precisa do repositório de OrdemVenda)

## O que construir

Extrair a lógica de orquestração de criação de OV e alteração de status para use cases na camada `application/use-cases/`. Os use cases encapsulam:

- Regras de negócio (validação de transporte autorizado, transição de estado)
- Chamada ao repositório
- Tratamento de erros de negócio (422 do servidor)
- Transformação entre DTOs e entidades de domínio

### Use cases

- `CriarOrdemVendaUseCase`:
  1. Validar `canUseTransporte(cliente, transporteId)` — regra de domínio
  2. Montar `CriarOVDTO`
  3. Chamar `IOrdemVendaRepository.criar(dto)`
  4. Tratar erro 422 (transporte não autorizado, cliente inativo)
  5. Retornar `OrdemVenda` ou erro de negócio

- `AlterarStatusOVUseCase`:
  1. Buscar OV atual via `repository.obterPorId(id)`
  2. Validar `canTransition(statusAtual, novoStatus)` — regra de domínio
  3. Chamar `repository.alterarStatus(id, novoStatus)`
  4. Tratar erro 422 (transição inválida do lado do servidor)
  5. Retornar `OrdemVenda` ou erro de negócio

### Hooks

- `useCriarOV` passa a instanciar/consumir o use case
- `useAlterarStatusOV` passa a instanciar/consumir o use case

Side-effects de toast e invalidação de cache ficam nos hooks (não nos use cases — use cases são puros de framework).

### Testes

- Testes unitários dos use cases com repositório mockado
- Cenários: sucesso, transporte não autorizado, transição inválida

## Critérios de aceitação

- [x] `CriarOrdemVendaUseCase` em `application/use-cases/`
- [x] `AlterarStatusOVUseCase` em `application/use-cases/`
- [x] Hooks de UI consomem use cases
- [x] Testes unitários com mock — sucesso + 2 cenários de erro cada
- [x] Fluxo E2E (criar OV + alterar status) continua funcionando
- [x] `tsc --noEmit` + `vitest run` (45/45) + `build` verdes

## Resolução

- `CriarOrdemVendaUseCase` e `AlterarStatusOVUseCase` criados em `application/use-cases/`
- `useOrdensVenda.ts` migrado para instanciar os use cases no módulo (singleton) e chamá-los nas mutations
- `AlterarStatusOVUseCase` valida `canTransition` antes de chamar o repositório
- CriarOrdemVendaUseCase repassa chamada ao repositório com suporte a headers extras (idempotência)
- 6 testes unitários (3 por use case): sucesso, erro de negócio, propagação de erro
- tsc, vitest (45/45), build verificados
