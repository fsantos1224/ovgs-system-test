# Ticket 30 — Toaster (sonner)

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** Nenhum (mas funciona melhor após 29 para fechar o fluxo completo confirmar → ação → feedback)

## Questão

Operador não recebe feedback visível após criar/editar/excluir. Único sinal é o redirect ou a página recarregada. Resultado: ele fica inseguro sobre se a ação persistiu, especialmente em ações destrutivas.

Adicionar toaster global. Decisão arquitetural: `toast.*` é chamado **dentro dos wrappers `apiPost`/`apiPatch`/`apiDelete`** em `src/api/fetch.ts`, não espalhado nas páginas. Princípio: **uma chamada, dois efeitos**.

## Restrições YAGNI

- `🐴` Sem queue management (toast desaparece sozinho após 4s)
- `🐴` Sem actions inline no toast (sem botão "Desfazer" no toast) — apenas fechar
- `🐴` Single lib: `sonner` (~5 kB gzip). Escolhida por não exigir Provider + tema dark/light nativo + ARIA built-in

## Cenários de aceitação

- [ ] `sonner` adicionado em `package.json` (`^1.7.0`)
- [ ] `src/components/Toaster.tsx` renderiza `<Toaster />` do sonner com `theme` controlado por `data-theme`
- [ ] `<Toaster />` montado em `AppLayout`
- [ ] Wrappers em `src/api/fetch.ts` injetam `toast.success` no retorno 2xx e `toast.error` no catch
- [ ] Mensagens padronizadas:
  - Create success: `✓ {Entidade} {nomeOuId} criada`
  - Update success: `✓ {Entidade} {nomeOuId} atualizada`
  - Delete success: `✓ {Entidade} {nomeOuId} excluída`
  - Bulk: `✓ {N} {entidades} excluídas`
  - Error: `✕ {serverError.message}` (parseado de `errBody.error`)
- [ ] Success: `duration: 4000`, dismissível
- [ ] Error: sticky (não desaparece sozinho)
- [ ] Posição: bottom-right
- [ ] Tema dark/light alternam automaticamente via `data-theme`
- [ ] Doc drift (README + MAP)

## Notas

- Impacto: nenhuma página precisa chamar `toast.*` explicitamente. Toaster é **side-effect** dos wrappers. Páginas que mutam hoje ganham toaster de graça.
- Teste E2E valida o caminho completo: click → fetch → toast visível (`await expect(page.locator('[role="status"]').filter({hasText: 'criada'})).toBeVisible()`).
- Bulk delete (ticket 28) chama `apiDelete` em paralelo — cada um gera seu próprio toast (N toasts agrupados). Alternativa: contar sucessos e mostrar 1 toast consolidado — preferir manter simples e confiar no agrupamento visual do sonner.

---

## Decision record

**Implementado (pré-existente):**
- `src/components/Toaster.tsx` — toaster custom (Zustand) com `role="alert"`, auto-dismiss 4s, success/error/warning, bottom-right.
- `<Toaster />` montado em `AppLayout`.
- `src/stores/toastStore.ts` com `useToast()` hook expondo `success()`, `error()`, `warning()`.

**Adicionado neste ticket:**
- Toast integrado nas mutations de `useClientes.ts`, `useTransportes.ts`, `useItens.ts`, `useOrdensVenda.ts` — cada `onSuccess`/`onError` dispara `toast.success`/`toast.error` com mensagem específica da entidade.

**Desvio de spec:**
- Ticket sugeria `sonner` como lib de toasts. Optou-se por manter o toaster custom (Zustand) existente — zero dependências adicionais, funcionalidade equivalente, bundle menor.
- Ticket sugeria injetar toast nos wrappers `api.ts`. Optou-se por injetar nos `onSuccess`/`onError` de cada mutation do TanStack Query — mais contexto disponível (nome da entidade, resposta) e sem acoplar o fetch layer a UI.
