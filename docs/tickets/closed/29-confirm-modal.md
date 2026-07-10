# Ticket 29 — Modal de confirmação (useConfirm)

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** Nenhum

## Questão

Toda ação mutante hoje dispara direto (criar OV, editar cliente, excluir item). Sem confirmação, exclusões acidentais são possíveis. Especificação do CONTEXT.md exige governança sobre alterações — confirmação explícita é o padrão de UX mínimo.

Adicionar hook `useConfirm()` que retorna `Promise<boolean>` e reusa o `<Modal>` nativo já existente.

## Restrições YAGNI

- Sem variantes elaborate ("3 passos de wizard") — só `default` | `danger`
- Sem input no modal (confirmação é só sim/não)
- Sem `<ConfirmProvider>` separado — reusa `<Modal>` direto, estado em Context único

## Cenários de aceitação

- [ ] `src/hooks/useConfirm.tsx` retorna função `(options: ConfirmOptions) => Promise<boolean>`
- [ ] `ConfirmOptions`: `title`, `body`, `confirmLabel` (default "Confirmar"), `cancelLabel` (default "Cancelar"), `variant` (default "default" | "danger")
- [ ] Modal mostra título, body, botão Cancelar, botão Confirmar (com cor `bg-rose-950/30 border-rose-500/30` se `variant: "danger"`)
- [ ] Cancelar (Esc, click-outside, ou botão) resolve `false`
- [ ] Confirmar resolve `true`
- [ ] `<ConfirmProvider>` montado em `AppLayout` para expor contexto
- [ ] A11y: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap nativo (do `<dialog>`)
- [ ] Unit test do hook: confirm resolve `true`, cancel resolve `false`
- [ ] Doc drift

## Notas

- API exemplo:
  ```ts
  const confirm = useConfirm();
  const ok = await confirm({
    title: 'Excluir cliente?',
    body: `${cliente.nome} será removido permanentemente.`,
    variant: 'danger',
  });
  if (!ok) return;
  await apiDelete(`/clientes/${id}`);
  ```
- Combina naturalmente com toaster (ticket 30) — depois do `apiDelete`, o wrapper dispara `toast.success` automaticamente.

---

## Decision record

**Implementado:**

- `useConfirm()` hook com Context + Provider, `ConfirmOptions` (title, body, confirmLabel, cancelLabel, variant).
- Variant `danger` com rose styling; Cancel/Esc resolve false; Confirm resolve true.
- Modal passou a aceitar `role` prop — confirm usa `role="alertdialog"` + `aria-modal="true"`.
- Unit test existente em `src/hooks/useConfirm.test.tsx`.
- Componente `Modal` atualizado com `aria-labelledby` e `aria-modal` para acessibilidade.

**Não implementado (fora do escopo original):**

- Integração com botões de excluir nas páginas (requer ticket 27 como pré-requisito).
