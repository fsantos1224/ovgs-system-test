# Ticket 14b — Transporte autorizado: dropdown dependente em OVNew

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** 14a (domain + server precisam existir primeiro)

## Questão

Depois do ticket 14a garantir que o servidor valida o transporte autorizado, falta o lado UI: `OVNew.tsx` mostra **todos** os tipos de transporte no dropdown, independentemente do cliente selecionado. O usuário pode escolher um combo inválido e só descobre o erro no 400 do servidor. UX ruim e não aproveita a regra já implementada no backend.

Este ticket faz o dropdown de transporte **depender do cliente selecionado**: ao mudar o cliente, o dropdown de transporte refiltra para mostrar só os autorizados.

## Restrições YAGNI

- Sem state global — `useState` local + `useEffect` já bastam
- Sem auto-seleção — se o transporte previamente escolhido não é válido, apenas limpa o campo

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

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código (`src/pages/OVNew.tsx`):**

- **L. 57-60** — `transportesDisponiveis = useMemo(() => (transportes ?? []).filter(t => canUseTransporte(clienteSelecionado, t.id)), ...)`. Dependências: `[transportes, clienteSelecionado]`.
- **L. 62-68** — efeito de "limpar transporte inválido" via `setValue("transporteId", "")` se o transporte previamente escolhido não consta nos autorizados do novo cliente.
- **L. 179-191** — `disabled={!clienteSelecionado}` no `<select>` de transporte, com mensagem contextual:
  - sem cliente → "Selecione um cliente primeiro"
  - cliente sem transporte → "Nenhum transporte autorizado"
  - normal → "Selecione..."
- **L. 88-89** — validação Zod adicional (`ovSchema.safeParse`) antes do POST captura erros de payload.
- **L. 281-285** — `serverError` (com `role="alert"`) exibe a mensagem 400 do servidor inline.

**Verificação:** E2E `e2e/ov-create.spec.ts:44-73` confirma que selecionar Beta (autorizado só [2]) esconde "Transportadora Rápida" (id 1) do dropdown.
