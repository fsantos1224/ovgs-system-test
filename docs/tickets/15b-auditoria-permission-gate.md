# Ticket 15b — Permission gate na página de Auditoria

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

ADR-04 declara que a UI esconde elementos que o usuário não pode usar via `usePermissao()`. O `Auditoria.tsx` **não tem** essa checagem: um `viewer` que digitar `/auditoria` na barra de endereço vê a tabela completa de eventos (PII, ações de outros usuários, etc.).

A página `Agendamento.tsx:16` já tem o padrão correto como referência.

## Restrições YAGNI

- `🐴` Mesmo padrão do `Agendamento.tsx` — early return com mensagem

## Cenários de aceitação

- [ ] `Auditoria.tsx` chama `usePermissao("auditoria:ver")` no topo
- [ ] Usuário sem permissão vê uma mensagem em vez da tabela
- [ ] Test E2E confirma: logado como `viewer`, navegação direta a `/auditoria` não renderiza eventos
- [ ] Test E2E confirma: logado como `manager`, a tabela renderiza normalmente
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final

## Notas

- O teste E2E pode aproveitar o `webServer` configurado em `playwright.config.ts` (que já sobe api + Vite).
- Sidebar já esconde o link para `viewer` — esse fix fecha a porta dos fundos (URL direta).

## Resolução

_a preencher ao fechar o ticket_