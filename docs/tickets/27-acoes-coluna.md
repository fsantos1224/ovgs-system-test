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

- `🐴` Sem menu dropdown — apenas 2 botões visíveis quando o usuário tem permissão
- `🐴` Sem confirmação inline — vem do ticket 29 (`useConfirm`)
- `🐴` Sem mudança em `OVList` "Detalhes" (esse botão já existe e tem semântica diferente — navegar, não mutar)

## Cenários de aceitação

- [ ] `Clientes.tsx`, `Transportes.tsx`, `Itens.tsx` ganham coluna "Ações" como última coluna (alinhada à direita, `w-32`)
- [ ] Botões com `aria-label="Editar {nome}"` / `"Excluir {nome}"` e ícones `Pencil` / `Trash2` (lucide-react)
- [ ] Render condicional por RBAC via `usePermissao`:
  - `viewer` → coluna não renderiza (ou vazia)
  - `operator/manager/admin` → botões visíveis
- [ ] Click em Editar navega para rota de edição (já existente em `Clientes` via `state` em memória) ou abre modal (cadastros simples)
- [ ] Click em Excluir dispara `useConfirm()` (ticket 29) e depois `apiDelete()`
- [ ] Auditoria: cada exclusão gera seu próprio evento (já implementado)
- [ ] Doc drift corrigido

## Notas

- Ações interagem com `useConfirm` + toaster (tickets 29 e 30). Durante a janela entre 27 e 29/30, as exclusões funcionam sem confirmação/toaster — degradação aceitável.
- `Auditoria.tsx` é só leitura, não recebe coluna de ações.
- `OVList` mantém o botão "Detalhes" existente (semântica diferente de edit).
- `OVDetail` já tem ações de mudança de status — não precisa de nova coluna "Editar/Excluir" (específico desta rota).
