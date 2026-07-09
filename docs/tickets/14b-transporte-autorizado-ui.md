# Ticket 14b — Transporte autorizado: dropdown dependente em OVNew

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** 14a (domain + server precisam existir primeiro)

## Questão

Depois do ticket 14a garantir que o servidor valida o transporte autorizado, falta o lado UI: `OVNew.tsx` mostra **todos** os tipos de transporte no dropdown, independentemente do cliente selecionado. O usuário pode escolher um combo inválido e só descobre o erro no 400 do servidor. UX ruim e não aproveita a regra já implementada no backend.

Este ticket faz o dropdown de transporte **depender do cliente selecionado**: ao mudar o cliente, o dropdown de transporte refiltra para mostrar só os autorizados.

## Restrições YAGNI

- `🐴` Sem state global — `useState` local + `useEffect` já bastam
- `🐴` Sem auto-seleção — se o transporte previamente escolhido não é válido, apenas limpa o campo

## Cenários de aceitação

- [ ] `OVNew.tsx` filtra `transportes` no dropdown baseado em `clienteSelecionado.transportesAutorizados`
- [ ] Ao trocar o cliente, se o transporte previamente escolhido não é autorizado, o select volta a "Selecione um transporte"
- [ ] Se o cliente não tem nenhum transporte autorizado, o dropdown fica disabled e mostra mensagem explicativa
- [ ] Submeter com combo inválido (forçando via DevTools) retorna o erro 400 do servidor e exibe inline
- [ ] Unit test adicional: `canUseTransporte` continua passando após uso no componente
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final

## Notas

- A forma mais limpa é derivar `transportesDisponiveis` com `useMemo` a partir de `clientesSelecionado` + `transportes` carregados.
- Quando o servidor retornar 400 por transporte não autorizado, a mensagem já está sendo exibida pelo error path do `apiPost`; basta garantir que a OV usa a variante que lança com `errBody.error`.

## Resolução

_a preencher ao fechar o ticket_