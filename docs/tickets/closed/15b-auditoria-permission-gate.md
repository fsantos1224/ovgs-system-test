# Ticket 15b — Permission gate na página de Auditoria

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

ADR-04 declara que a UI esconde elementos que o usuário não pode usar via `usePermissao()`. O `Auditoria.tsx` **não tem** essa checagem: um `viewer` que digitar `/auditoria` na barra de endereço vê a tabela completa de eventos (PII, ações de outros usuários, etc.).

A página `Agendamento.tsx:16` já tem o padrão correto como referência.

## Restrições YAGNI

- Mesmo padrão do `Agendamento.tsx` — early return com mensagem

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

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código (`src/pages/Auditoria.tsx:18-49`):**

```tsx
const podeVer = usePermissao("auditoria:ver");
if (!podeVer) {
  return ( /* card de "Acesso negado" com ShieldCheck + role="alert" */ );
}
```

Mesmo padrão do `Agendamento.tsx`, referenciado no ticket como referência. Sidebar já esconde o link para roles sem permissão — esse fix fecha a URL direta (`/auditoria`).

**Verificação:** O gate é puramente client-side (RBAC UI-level conforme ADR-04 do projeto). Validação server-side não se aplica porque os endpoints REST de auditoria são protegidos por outras camadas — o escopo deste ticket era só fechar a porta dos fundos na UI. Os E2E de RBAC existentes (`e2e/rbac.spec.ts`) exercitam a navegação e continuam verdes.
