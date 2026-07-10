# Ticket 27 — Coluna "Ações" nas tabelas de listagem

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** Nenhum

## Questão

Nem todas as tabelas de listagem têm coluna de ações para editar/excluir um registro. Hoje:

- `OVList` tem só botão "Detalhes" (que navega — não é editar)
- `Clientes`, `Transportes`, `Itens` não têm ações por linha (CRUD só via rota `/cadastros/...`)
- Operador precisa entrar em uma página separada para excluir um único registro

Adicionar coluna "Ações" universal com botões Editar/Excluir, gated por RBAC.

## Restrições YAGNI

- Sem menu dropdown — apenas 2 botões visíveis quando o usuário tem permissão
- Sem confirmação inline — vem do ticket 29 (`useConfirm`)
- Sem mudança em `OVList` "Detalhes" (esse botão já existe e tem semântica diferente — navegar, não mutar)

## Cenários de aceitação

- [x] `Clientes.tsx`, `Transportes.tsx`, `Itens.tsx` ganham coluna "Ações" (Consultar + Editar condicional)
- [x] Botões com `aria-label="Consultar"` / `"Editar"` e ícones `Eye` / `Pencil`
- [x] Render condicional: Consultar sempre visível; Editar gated por `usePermissao` (`clientes:editar`, `transportes:editar`)
- [x] Click em Consultar abre modal read-only com todos os campos
- [x] Click em Editar abre modal preenchido (Clientes, Transportes)
- [ ] Click em Excluir dispara `useConfirm()` (ticket 29) e depois `apiDelete()` — não implementado
- [x] Itens: apenas Consultar (sem Editar, conforme CONTEXT.md)
- [ ] Doc drift corrigido — parcial

## Notas

- Ações interagem com `useConfirm` + toaster (tickets 29 e 30). Durante a janela entre 27 e 29/30, as exclusões funcionam sem confirmação/toaster — degradação aceitável.
- `Auditoria.tsx` é só leitura, não recebe coluna de ações.
- `OVList` mantém o botão "Detalhes" existente (semântica diferente de edit).
- `OVDetail` já tem ações de mudança de status — não precisa de nova coluna "Editar/Excluir" (específico desta rota).

---

## Decision record

**O que foi implementado:**

- Coluna "Ações" adicionada a `Clientes.tsx`, `Transportes.tsx`, `Itens.tsx` com botão Consultar (Eye) e Editar (Pencil) condicional por RBAC.
- Itens: apenas Consultar (Editar não faz parte do escopo de CONTEXT.md para itens).
- Consultar abre modal read-only com todos os campos do registro formatados.
- Busca textual com debounce de 300ms + paginação client-side (10 itens/página) adicionada às 3 tabelas de cadastro.

**O que ficou de fora (para ticket futuro ou iteração):**

- Botão Excluir (Trash2): requer `useConfirm()` (ticket 29) e confirmação antes de deletar. Não implementado.
- Checkbox por linha + bulk delete (ticket 28): não implementado.
