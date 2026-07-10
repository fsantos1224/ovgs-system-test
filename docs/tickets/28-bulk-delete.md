# Ticket 28 — Seleção múltipla + bulk delete

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** 27 (depende da coluna Ações existir — a seleção cabe na mesma conversão)

## Questão

Operador com 30 OVs para cancelar precisa clicar 30x. Sem seleção múltipla em nenhuma tabela. Falta também confirmação explícita do bulk action e feedback consolidado.

## Restrições YAGNI

- Sem shift-click range selection — só toggle individual + toggle-all na linha de header
- Sem endpoint novo `POST /bulk-delete` — usar `Promise.allSettled` com DELETE por item (preserva auditoria individual)
- Sem persistir seleção no reload — local state, limpo quando componente desmonta ou filtro muda
- Sem tooltips "1 selecionado" — counter simples é suficiente

## Cenários de aceitação

- [ ] Cada tabela ganha coluna inicial com checkbox por linha + header com checkbox "select-all" (`aria-label="Selecionar todos"`)
- [ ] State local `useState<Set<string>>(new Set())` com UUIDs selecionados
- [ ] Quando `selected.size >= 1`, action bar fixa no rodapé da tabela: `"N selecionados"` + botão `"Excluir selecionados"` + botão `"Cancelar seleção"`
- [ ] Botão "Excluir selecionados" disabled quando `selected.size === 0`
- [ ] Click em "Excluir selecionados" → `useConfirm()` (ticket 29) listando os primeiros 5 nomes + "... e mais N"
- [ ] Após confirmar: `Promise.allSettled(ids.map(id => apiDelete(`/entidade/${id}`)))` — falhas não bloqueiam sucessos
- [ ] Após término:
  - `success` toaster com count de sucessos
  - `error` toaster com count + nomes das falhas (se houver)
  - Limpar seleção
- [ ] Mudança de filtro (status, cliente, data) limpa seleção
- [ ] Permission gate: se usuário não pode excluir, checkbox column não renderiza
- [ ] Doc drift

## Notas

- "Sem endpoint novo" preserva o invariante "cada mutação gera 1 evento de auditoria" (ticket 22). Bulk vira N eventos.
- Limite sugerido: se `selected.size > 10`, mostrar warning no modal ("Você está prestes a excluir 50 itens. Continuar?").
- Action bar pode ser fixa (`sticky bottom-0`) ou simplesmente uma linha acima do footer da tabela — sem preferência forte, escolher a mais simples.
