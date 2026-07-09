---
id: spec-ui-polish
status: ready-for-agent
priority: medium
area: frontend
blocked_by: []
---

# Spec — UI Polish, Brand Color, Breadcrumbs Dinâmicos

> Síntese de `docs/PLAN-2.md`. Esta spec é o ponto de entrada para o agente; dela derivam 7 tickets de implementação na fronteira da seção 5 do plano.

---

## Problem Statement

O operador do XPTO (gerente de logística) trabalha o dia todo dentro do sistema. Hoje ele:

1. **Não recebe feedback das ações** — quando cria uma OV, edita um cliente ou exclui um item, a única confirmação é o redirect ou a página recarregada. Em ações destrutivas (DELETE) ele fica inseguro: "será que foi?".
2. **Não consegue selecionar várias OVs para excluir de uma vez** — tem que clicar uma a uma. Para 30 entregas canceladas no fim do dia, isso é 30 cliques + 30 confirmações.
3. **Não sabe em qual rota está olhando** — os "kickers" do tipo `Ordens de Venda / DETALHES` são hardcoded por página. Se ele chega via deep-link, não tem rastro de navegação.
4. **A cor de destaque (Amber/Gold) destoa da brand** — o stakeholder pediu alinhamento com tom de azul corporativo.
5. **Inputs de valor não são intuitivos** — campos monetários ficam sem máscara padrão, gerando erros de digitação ("era 5 mil ou 50 mil?").

Esses cinco problemas afetam produtividade e percepção de profissionalismo do produto num MVP de backoffice logístico.

---

## Solution

Cinco incrementos convergentes em uma única release:

1. **Toaster global** dispara mensagem padronizada após cada mutação (criar/editar/excluir). Implementado dentro do wrapper de fetch (`apiPost`/`apiPatch`/`apiDelete`) — uma chamada, dois efeitos.
2. **Modal de confirmação** (`useConfirm()`) intercepta toda ação mutante destrutiva ou crítica (criar, editar, excluir). Reusa o `<Modal>` nativo já existente.
3. **Coluna "Ações"** em todas as tabelas de listagem (Clientes, Transportes, Itens, OVs) com botões Editar/Excluir. Checkbox por linha + checkbox-all + ação flutuante "Excluir N selecionados" no rodapé.
4. **Breadcrumbs dinâmicos** derivados de `useMatches()` do react-router, com `handle.crumb` declarado por `<Route>`.
5. **Tema dark** com accent `--color-accent` migrado de Amber `#f59e0b` para Blue `#3b82f6`. Badges de status (CRIADA, AGENDADA etc.) permanecem com cores semânticas (amber/sky/emerald/purple/zinc).

Máscara monetária BRL: revisitado — backend armazena valores em centavos (inteiro). Display já usa `Intl.NumberFormat("pt-BR", currency: "BRL")` que é o padrão BRL. Sem migração de schema no escopo, o helper `parseBRLtoCents()` será exposto para uso futuro se inputs decimais forem necessários.

---

## User Stories

### Confirmação

1. As an operador, I want a confirmation modal before creating a OV, so that I can verify the data before committing.
2. As an operador, I want a confirmation modal before editing a Cliente, so that I can review the changes before they are persisted.
3. As an operador, I want a confirmation modal before excluding any record (Cliente, Transporte, Item, OV), so that I don't lose data by accident.
4. As a viewer, I want confirmation modals to NOT appear (since I cannot mutate), so that the UI is consistent with my read-only role.
5. As an operador, I want pressing Esc inside a confirmation modal to cancel the action, so that I have a keyboard shortcut.
6. As an operador, I want pressing the Cancel button or clicking outside the modal to dismiss the modal without acting, so that I have multiple escape paths.
7. As an operador, I want the "Confirm" button to be visibly destructive (red on rose palette) when the action is destructive, so that I receive a clear visual cue.

### Toaster

8. As an operador, after creating a OV I want to see a success toast with the OV number and client, so that I have immediate confirmation without checking the list.
9. As an operador, after editing a Cliente I want to see a success toast with the Cliente name, so that I confirm the edit was persisted.
10. As an operador, after excluding records I want to see a success toast with the count of items affected, so that I confirm the bulk delete worked.
11. As an operador, after a server error (ex. transport not authorized for client) I want to see an error toast with the server message, so that I understand what went wrong without DevTools.
12. As an operador, I want toasts to disappear automatically after a few seconds, so that they don't pile up.
13. As an operador, I want error toasts to persist until I dismiss them, so that I have time to read what happened.

### Ações por linha + Bulk delete

14. As an operador, in the OVs list I want a checkbox on each row, so that I can select multiple OVs.
15. As an operador, in any list I want a "select all" checkbox in the header row, so that I don't have to click each one when I want all of them.
16. As an operador, when I have ≥1 selected, I want a floating action bar showing "N selecionados" and "Excluir selecionados", so that I see the current selection state.
17. As an operador, when I click "Excluir selecionados" I want a confirmation modal listing the names of the affected records, so that I can verify what I'm about to delete.
18. As an operador, I want the bulk delete to proceed even if some individual deletes fail (e.g. one record is locked), so that a single failure doesn't block me.
19. As an operador, after bulk delete I want one success toast with the total count and one warning toast with the partial failures count, so that I have an honest summary.
20. As an operador, when I select rows and navigate to a different page, I want the selection to clear, so that I don't act on a stale selection.
21. As a viewer, I want checkboxes to NOT appear (or be disabled), so that the UI is consistent with my read-only role.

### Coluna Ações

22. As an operador, in any list I want a column "Ações" with Edit and Delete buttons per row, so that I have a clear entry point for mutations.
23. As a viewer, in any list I want the "Ações" column to NOT show edit/delete buttons (or hide the column entirely), so that the UI is consistent with my read-only role.
24. As an operador, I want the Edit and Delete buttons to have descriptive `aria-label`s ("Editar cliente Alpha", "Excluir cliente Alpha"), so that screen readers announce them clearly.

### Breadcrumbs

25. As an operador, on every page I want a breadcrumb showing the path from the root to the current page, so that I have spatial orientation.
26. As an operador, when I navigate deeper (e.g. `/ovs/:id`) I want the breadcrumb to reflect the new path automatically, so that I don't have to guess where I am.
27. As an operador, when I land on a deep link (ex. shared by a teammate) the breadcrumb should still render correctly, so that I can navigate up to the parent list.
28. As a keyboard user, I want the breadcrumb's last item to have `aria-current="page"` so that screen readers know it's the current location.

### Dark theme — accent

29. As an operador using dark theme, I want the highlights (active nav item, primary buttons, focus rings, link hover, KPI numbers) to use a brand-aligned blue, so that the product feels coherent with the company identity.
30. As an operador using dark theme, I want status badges (CRIADA, AGENDADA, ENTREGUE) to retain their semantic colors (amber, sky, emerald), so that the operational status remains visually distinct.
31. As an operador, I want to switch between dark and light themes via the toggle without losing the brand-aligned accent in either, so that the experience is consistent.

### Money mask (helpers only)

32. As a future developer adding a decimal-input form field, I want a `parseBRLtoCents(str): number` helper available in the codebase, so that I can quickly parse "R$ 1.500,00" into 150000 without pulling in a library.

---

## Implementation Decisions

### Libs

- **One library added:** `sonner` (~5 kB gzip). Chosen over `react-hot-toast` because:
  - No Provider required (one less wrapper in `AppLayout`)
  - Native dark/light theme support via `theme` prop
  - ARIA live region built-in
  - Smaller API surface than alternatives

### Architectural decisions

- **Toaster side-effect inside fetch wrappers** — `src/api/fetch.ts:apiPost` / `apiPatch` / `apiDelete` invoke `toast.success` / `toast.error` themselves. Zero `toast.*` calls scattered through page components. One fetch call → one toast. This is the **highest-leverage seam**: a single change to the wrapper changes all UI feedback.
- **Confirmation modal via Context** — `<ConfirmProvider>` mounted once in `AppLayout`. Pages consume via `const confirm = useConfirm();` hook returning `Promise<boolean>`. Reuses the existing `<Modal>` component (`src/components/Modal.tsx`) — no new portal lib.
- **Bulk delete via `Promise.allSettled`** — no new `POST /bulk-delete` endpoint. Each DELETE goes through the standard endpoint so each one logs its own audit event (consistent with the existing "every mutation is audited" rule). Partial failures surface as a single warning toast with the count.
- **Breadcrumbs via `useMatches()`** — react-router-dom v6 already exposes matched route handles. Each `<Route>` in `App.tsx` declares `handle={{ crumb: () => "Nome" }}`. For dynamic params (e.g. `OV-2025-0042`), the crumb function reads from `useParams()`. The hook reads `useMatches()`, filters out routes without crumb, returns ordered list.
- **Dark accent migration is token-only** — the change is exclusively in `src/index.css`:
  - `--color-accent: #f59e0b` → `#3b82f6`
  - `--color-accent-soft: rgb(245 158 11 / 0.15)` → `rgb(59 130 246 / 0.15)`
  - `--color-on-accent: #000000` → `#ffffff`
  - Light theme keeps Sky (already blue) — only the dark theme accent changes.
  - Badge colors (`bg-amber-950/30` for CRIADA) **do not** change because they are semantic, not brand.
- **Money display unchanged** — backend stores values in integer centavos. Display uses `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` which is the canonical BRL formatter. No schema migration. A `parseBRLtoCents()` helper is added as a forward-looking utility for when decimal-input forms are introduced.

### Interaction contracts

- **`useConfirm(options): Promise<boolean>`**
  - options.title: string
  - options.body: string | ReactNode
  - options.confirmLabel: string (default "Confirmar")
  - options.cancelLabel: string (default "Cancelar")
  - options.variant: "default" | "danger" (default "default")
  - Returns true if user confirmed, false if cancelled/Esc/click-outside.

- **Toast patterns**
  - Create success: `✓ {Entidade} {nomeOuId} criada`
  - Update success: `✓ {Entidade} {nomeOuId} atualizada`
  - Delete success: `✓ {Entidade} {nomeOuId} excluída`
  - Bulk success: `✓ {N} {entidades} excluídas`
  - Error: `✕ {serverErrorMessage}` (from `errBody.error`)
  - Duration: success 4s, error sticky (until dismissed)

- **Route handle schema**
  - `handle.crumb?: () => string` — pure function returning the label
  - For dynamic params: `handle.crumb: () => useParams().id` (we accept the hook call inside because matches evaluate on each render)

### What the agent should NOT do

- Do **not** introduce a new portal library (no `react-portal`, `headlessui`, `radix-ui`).
- Do **not** migrate the schema to decimal monetary values.
- Do **not** add Undo / soft-delete to the DELETE flow.
- Do **not** introduce i18n.
- Do **not** add Storybook or chromatic visual tests.
- Do **not** refactor existing pages to a different state library (Zustand, Redux, etc.).
- Do **not** add a separate toast manager / queue.

---

## Testing Decisions

### What makes a good test here

A test must exercise behavior visible to the user, not implementation details:

- **Good**: "After clicking 'Excluir' and confirming, the row disappears from the table and a toast saying 'Cliente Alpha excluído' appears."
- **Bad**: "The component has a `useState` cell for `showDialog` that becomes `false` after escape."

### Seams — which level to test at

This spec has **two seams** with different heights:

#### Seam 1 (highest): E2E Playwright

The primary seam for all 7 increments. Justification: every increment is UI-layer (toaster, modal, bulk select, breadcrumb, color). The Playwright suite already runs against the full stack (`webServer` in `playwright.config.ts`). One E2E per increment covers the visible behavior end-to-end.

| Increment | E2E coverage |
|---|---|
| Toaster | Click "Criar" → assert `[role="status"]` toast text appears |
| Confirmação | Click "Excluir" → assert modal opens, click Cancel → assert no row gone, click Confirm → assert row gone |
| Ações | Click Edit/Delete buttons → assert correct navigation/modal |
| Bulk delete | Tick 2 checkboxes + "Excluir selecionados" → confirm → assert two rows gone + toast with count=2 |
| Breadcrumbs | Navigate to `/ovs/:id` → assert breadcrumb has 3 items with correct labels |
| Dark accent | `npm run build` + `page.screenshot()` of dark theme → visual review (manual check on PR) |

#### Seam 2 (lower, focused): Unit tests for new hooks

Only `useConfirm` and `useBreadcrumbs` get unit tests, because they are the only logic-bearing artifacts introduced that are testable in isolation without spinning up a full server.

| Hook | Test |
|---|---|
| `useConfirm()` | Returns a function. Calling it resolves to `true` on confirm, `false` on cancel. (Tested via `renderHook` + provider wrapper.) |
| `useBreadcrumbs()` | Given mocked `useMatches()` returning [{handle: {crumb: () => "A"}}, {handle: {crumb: () => "B"}}], returns `[{label: "A", href: "/a"}, {label: "B", href: "/b"}]`. |

#### What is NOT tested at any seam

- Manual visual aesthetic of Blue vs Amber (covered by reviewer on PR with screenshot)
- React Router's `useMatches` itself (third-party)
- Sonner's internal rendering (third-party)
- `Intl.NumberFormat` behavior (native browser API, no value in re-testing)

### Prior art in this codebase

- `e2e/rbac.spec.ts` — pattern for setting localStorage role, navigating, asserting DOM
- `e2e/ov-detail.spec.ts` — pattern for fetching list via API in `beforeAll` to get a valid UUID
- `tests/integration/server.test.ts` — pattern for spawning the dev server with `mkdtempSync` data
- `src/domain/types.test.ts` — pattern for unit tests of pure functions with `vitest`

---

## Out of Scope

- Schema migration from integer centavos to decimal monetary values
- Full internationalization (i18n) of strings and number formats
- Automatic theme switching based on `prefers-color-scheme`
- Time-based automatic dark mode (sunset/sunrise)
- Storybook for any of the new components
- Drag-and-drop bulk selection
- Undo for delete (no soft delete)
- Re-doing the typography (Playfair Display + Inter + JetBrains Mono)
- Generating mock data for new columns / fields
- Email/Slack notifications on toast events
- Mobile-first redesign of the tables

---

## Further Notes

### Migration / rollout

This spec is implemented as **7 tickets** in the project's `docs/tickets/` folder, in the order specified by the dependency graph in `docs/PLAN-2.md` section 5:

1. (26) Money helpers
2. (27) Ações column
3. (28) Bulk delete — depends on 27
4. (29) Confirmation modal
5. (30) Toaster (sonner) — best paired with 29
6. (31) Breadcrumbs
7. (32) Dark accent migration

The agent receives one ticket at a time. Each ticket closes by appending a "Resolução" section and moving to `docs/tickets/closed/`.

### Architectural risk: toast inside fetch wrappers

Putting `toast.*` calls inside `apiPost`/`apiPatch`/`apiDelete` couples UI feedback to the data layer. Three mitigations already in place:

1. The toast call is wrapped in try/catch so a toast failure never bubbles.
2. Each wrapper accepts an optional `extraHeaders` parameter (for `idempotency-key`) — adding an optional `silent` flag would be a one-line escape hatch if a future caller doesn't want a toast.
3. The wrappers are tree-shakeable (`apiGet` vs `apiPost`) so a caller using only reads is unaffected.

If this coupling becomes a problem in the future (e.g. background sync), the wrappers' body becomes `(dispatch) => Promise<data>` and toasts become `dispatch({type: "toast", ...})`. YAGNI for now.

### Visual review at PR time

Two PR-level visual checks are out of scope for automation:
- Confirm dark theme's Blue accent is "on-brand" (reviewer judgment)
- Confirm light theme is unaffected

The reviewer should `npm run dev` (or open the preview build) and look. The agent **must** attach screenshots of both themes in dark and light to the closing ticket when finishing ticket 32.
