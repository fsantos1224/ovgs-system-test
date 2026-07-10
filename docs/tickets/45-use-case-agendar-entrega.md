# Ticket 45 — Use case: AgendarEntrega

**Tipo:** `wayfinder:feature`

**Bloqueado por:** 42 (precisa do repositório de OrdemVenda)

## O que construir

Extrair a lógica de agendamento para um use case dedicado. Atualmente o agendamento é feito via PATCH direto na OV. O use case orquestra validações e a transição de estado quando aplicável.

### Use case

- `AgendarEntregaUseCase`:
  1. Buscar OV atual via `repository.obterPorId(id)`
  2. Validar que a OV está em status elegível (`PLANEJADA` ou `AGENDADA`)
  3. Validar formato da janela de atendimento (HH:MM-HH:MM, fim > início)
  4. Se OV está `PLANEJADA` e data+janela são informadas, chamar `repository.alterarStatus(id, "AGENDADA")`
  5. Chamar `repository.atualizar(id, { dataEntregaPrevista, janelaAtendimento })`
  6. Retornar `OrdemVenda` atualizada ou erro de negócio

### Hook

- O hook da Central de Agendamento consome o use case

### Testes

- Testes unitários do use case com repositório mockado
- Cenários: OV elegível, OV já agendada (reagendamento), janela inválida, status não elegível

## Critérios de aceitação

- [ ] `AgendarEntregaUseCase` em `application/use-cases/`
- [ ] Central de Agendamento funcionando via use case
- [ ] Testes unitários com mock — sucesso + 3 cenários de erro
- [ ] Fluxo E2E de agendamento continua funcionando
- [ ] `tsc --noEmit` + `vitest run` verdes
