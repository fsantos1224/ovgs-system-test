# PLAN — Rebrand Visual XPTO (Tema Light / Ápice Consultoria)

> Documento de planejamento. **Nenhuma implementação será feita antes da aprovação.**

---

## 1. Goal

Reaplicar a **linguagem visual** do `.prototype/` (cartões limpos, tipografia editorial, micro-animações sutis) sobre o frontend atual do XPTO, **invertendo a paleta para o Tema Claro corporativo** inspirado em **Ápice Consultoria / Thera Consulting**: azul corporativo profundo (estrutura), aqua/laranja (sinais), branco + cinza-ultraleve (superfícies), texto grafite (não preto puro). A arquitetura (Router, RBAC, json-server, testes, Docker) **não muda** — é uma repintura, não uma reescrita.

---

## 2. Design Tokens (Ápice)

```css
/* Em CSS-first, todos entram em @theme dentro de src/index.css */

--color-primary-900: #0b2545; /* sidebar / header / títulos estruturais */
--color-primary-700: #13315c; /* hover sidebar / borda ativa */
--color-primary-500: #1e4e8c; /* links institucionais, ícones estruturais */

--color-accent-500: #0ea5e9; /* aqua — CTA secundário, links, ícones de ação */
--color-accent-600: #0284c7; /* hover do aqua */
--color-warn-500: #f97316; /* laranja — só para alertas/destaques críticos */

--color-surface-0: #ffffff; /* canvas de cards, modais, inputs */
--color-surface-50: #f8fafc; /* zebra de tabela, fundo do <main> */
--color-surface-100: #f1f5f9; /* cabeçalho de tabela, blocos alternados */

--color-border: #e2e8f0; /* bordas sutis (slate-200) */
--color-text-900: #1f2937; /* grafite — corpo principal (graphite, não preto) */
--color-text-700: #374151; /* secundário forte */
--color-text-500: #64748b; /* labels, metadados */
--color-text-400: #94a3b8; /* placeholders, disabled */
--color-danger-500: #dc2626; /* erros de validação (mantém vermelho WCAG AA) */

/* Tipografia — manter Inter (já no projeto, equivalente Roboto/Open Sans */
--font-sans: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace; /* SKUs/IDs/valores */

/* Espaçamento — escala Tailwind padrão (4, 8, 12, 16, 24) */
--radius-card: 8px; /* 🐴 mais conservador que rounded-2xl do .prototype */
--shadow-card: 0 1px 2px rgba(15, 23, 42, 0.06); /* sombra leve B2B */
```

Sem bordas ultra-arredondadas (`rounded-2xl`), sem JetBrains Mono para tudo — só números/SKUs.

---

## 3. Scope (arquivos a modificar)

### Configuração (5 arquivos)

| Arquivo              | Ação                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `package.json`       | Tailwind v3 → v4; `+tailwindcss@^4`, `+@tailwindcss/vite`; `+lucide-react`; `+@vitejs/plugin-react@^5` |
| `vite.config.ts`     | Importar `tailwindcss()` plugin em vez de PostCSS                                                      |
| `tailwind.config.js` | **DELETAR** (v4 usa `@theme` no CSS)                                                                   |
| `postcss.config.js`  | **DELETAR**                                                                                            |
| `tsconfig.json`      | Sem mudança                                                                                            |
| `src/index.css`      | Reescrita total: `@import "tailwindcss"` + bloco `@theme` + keyframe `fadeIn` + scrollbar light        |

### Views / Componentes (13 arquivos — todos os `.tsx` de UI)

- `src/layouts/AppLayout.tsx` — sidebar vira **light corporate** (fundo `primary-900`, texto branco, item ativo `accent-500`); **toggle de colapso** (apenas ícones) com estado local — `ponytail: useState simples, sem Context`
- `src/pages/Login.tsx` — card branco sobre `surface-50`, botão `accent-500`
- `src/pages/Dashboard.tsx` — KPIs em card branco, números grafite, badges de status com nova paleta
- `src/pages/OVList.tsx` — tabela zebra `surface-0` / `surface-50`, header `primary-900` texto branco
- `src/pages/OVDetail.tsx` — `surface-0` cards, botões de transição `accent-500`
- `src/pages/OVNew.tsx` — formulário, mesmos componentes estilizados
- `src/pages/Agendamento.tsx` — badges PLANEJADA âmbar (`warn-500`), AGENDADA aqua (`accent-500`)
- `src/pages/Clientes.tsx`, `Itens.tsx`, `Transportes.tsx` — tabelas + modal consistentes
- `src/pages/Auditoria.tsx` — tabela com `font-mono` em IDs/timestamps
- `src/pages/NotFound.tsx` — mesmo padrão visual
- `src/components/Modal.tsx`, `Pagination.tsx` — paleta + radius consistentes

### Infra light

- `index.html` — adicionar `<link rel="preconnect" href="https://fonts.googleapis.com">` 🐴 (perf, mas opcional)

---

## 4. Files NOT to Touch (arquitetura preservada)

- **Router**: `src/App.tsx`, qualquer arquivo de rota
- **Estado/Hooks**: `src/hooks/useFetch.ts`, `usePaginatedFetch.ts`, `useAuth.ts`, `usePermission.ts`
- **API**: `src/api/fetch.ts`
- **Domínio**: `src/domain/types.ts`, `src/domain/*.ts`, `src/auth/credentials.ts`
- **Dados**: `src/data/*.ts`, `src/data/*.json`, `db.seed.json` (template), `data/db.json` (runtime)
- **Telemetria**: `src/lib/telemetry.ts`
- **Mock backend**: `server.cjs` — json-server inteiro
- **Testes**: `e2e/*.spec.ts` (4 arquivos), `vitest.config.ts` (se existir), testes unitários
- **Container**: `Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.dockerignore`
- **Tickets abertos (13–19)**: nenhum é tocado por este plano — worktree paralela

---

## 5. Implementation Steps (incrementalmente verificável)

1. **Dependências** — `npm uninstall tailwindcss postcss autoprefixer && npm i -D tailwindcss@^4 @tailwindcss/vite && npm i lucide-react`. Verificar `npm run build` ainda compila.
2. **CSS-first tokens** — reescrever `src/index.css` com `@theme { ... }`. Confirmar que tokens customizados viram classes (`bg-primary-900`, `text-accent-500`). `ponytail: usar @theme inline em vez de CSS variables avulsas`
3. **Botão canário** — em `OVList.tsx`, aplicar `bg-accent-500` no botão "Nova OV" e `bg-surface-50` no `<main>`. **Smoke**: `npm run dev` + login admin → OV list com 1 elemento repintado.
4. **Tabela completa** — `OVList.tsx`: zebra, header `primary-900`. Semântica HTML preservada (caption sr-only, role=region).
5. **Sidebar** — `AppLayout.tsx`: substituir paleta + adicionar ícones `lucide-react`. Implementar colapso: estado `collapsed: boolean`, largura `w-64` ↔ `w-16`, esconder labels com `hidden` quando colapsado. Botão `<<` / `>>` no header.
6. **Páginas restantes** — replicar tokens em todas as views (Login, Dashboard, Detail, New, Agendamento, cadastros, Auditoria, 404).
7. **Modal + Pagination** — mesma paleta + radius.
8. **Scrollbar estilizada** — adicionar `::-webkit-scrollbar` no `index.css`, track `surface-50`, thumb `primary-500`.
9. **Micro-animações** — keyframe `fadeIn` (já no `.prototype`) em cards/listas. `ponytail: CSS only, sem framer-motion/GSAP — uma @keyframes resolve 80% dos casos`
10. **A11y check** — `focus-visible:outline-2 focus-visible:outline-accent-500` em todos os interativos; contraste mínimo 4.5:1; aria-labels intactos.

Cada passo é commitável e testável isoladamente.

---

## 6. Dependencies (delta exato)

```diff
  dependencies:
+   lucide-react               ^0.546.0
  devDependencies:
-   autoprefixer               ^10.4.20
-   postcss                    ^8.4.49
-   tailwindcss                ^3.4.15
+   tailwindcss                ^4.1.14
+   @tailwindcss/vite          ^4.1.14
```

**Removidos**: `autoprefixer`, `postcss` (v4 não usa).
**Adicionados**: `tailwindcss@4`, `@tailwindcss/vite` (plugin oficial), `lucide-react`.
**NÃO adicionados**: `gsap` (YAGNI — animações-chave são CSS), `framer-motion`, `clsx` (Tailwind utility classes bastam), `tailwind-merge`.

---

## 7. Risk Register

| #   | Risco                                                                                                                                                                                                                          | Mitigação                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| R1  | **Testes E2E** referenciam `localStorage.setItem("XPTO:role", "admin")` e `getByRole("button", { name: "Criar OV" })` — ambos **preservados** pela nova paleta (não mudamos labels nem storage keys).                          | Rodar `npx playwright test` após passo 3; nenhum spec precisa de edição.                      |
| R2  | **Contraste WCAG**: `text-text-500 #64748B` sobre `surface-50 #F8FAFC` ≈ 4.6:1 ✅. `accent-500 #0EA5E9` em botão branco ≈ 3.1:1 ❌ para texto — usar só para ícones/bordas, texto do CTA em branco sobre `accent-600 #0284C7`. | Definir contrato explícito no `index.css`: "CTA texto sempre branco sobre accent-600".        |
| R3  | **a11y regressions**: classes `focus-visible:outline-slate-400` sumiriam na migração → precisa reescrever para `focus-visible:outline-accent-500` em todos os `.tsx`.                                                          | Grep `focus-visible` antes do build; substituir em batch via edit único.                      |
| R4  | **Selector drift** em testes: `.bg-slate-800` deixa de existir no DOM se alguém fizer refactor semântico.                                                                                                                      | Testes Playwright usam `getByRole` (não classes) — imunes.                                    |
| R5  | **Tailwind v4 build**: classes customizadas só funcionam se listadas no `@theme`. Esquecer `--color-accent-500` quebraria `bg-accent-500` em runtime (não em build).                                                           | `npm run build` + smoke manual em todas as páginas; build-time warnings se classe não existe. |
| R6  | **Bundle splitting** (ticket 18) pode ser afetado pela troca de plugin Tailwind. `manualChunks` em `vite.config.ts` é independente do plugin → seguro.                                                                         | Verificar `dist/assets/` mostra 3+ chunks após build.                                         |
| R7  | **Dockerfile** usa `node:20-alpine` e `npm install` (sem lock estrito). v4 não muda requirements de runtime.                                                                                                                   | Build Docker fica para verificação manual ao final.                                           |
| R8  | **Scrollbar styled** não funciona no Firefox (`::-webkit-scrollbar` é WebKit-only).                                                                                                                                            | Documentar fallback: Firefox usa scrollbar nativa — aceitável para B2B interno.               |
| R9  | **Sidebar colapsada em mobile**: `w-16` num viewport de 360px deixa <200px para conteúdo.                                                                                                                                      | 🐴 Não tratar mobile agora — backoffice desktop-only (escopo original).                       |

---

## 8. Verification Plan

Após cada passo:

1. `npm run build` → sem erros TS, sem warnings Tailwind.
2. `npm run dev:full` → login como admin.
3. Smoke visual (manual, checklist):
   - [ ] Login: card branco sobre cinza claro, botão aqua.
   - [ ] Sidebar: azul corporativo, item ativo com detalhe aqua.
   - [ ] OV List: header de tabela azul, zebrada, badges coloridas por status.
   - [ ] Colapso de sidebar: clique no `<<` esconde labels, mantém ícones.
   - [ ] Modais: cantos `rounded-lg`, sombra sutil.
   - [ ] Scrollbar custom aparece em overflow.
4. `npx playwright test` → 4 specs, todas verdes.
5. `npm run test` (vitest) → unit tests verdes (não-tocados mas sanity).
6. `docker compose build frontend` → build sem erros.
7. Lighthouse/F12 contrast spot-check em `bg-accent-500 text-white` (botões CTA).

---

## 9. Open Questions (precisam de resposta antes do passo 1)

1. **GSAP**: o briefing original pedia GSAP. Para Ápice (B2B sério), proponho **não usar** — `@keyframes` + `transition-*` cobrem fade-in de cards, hover de linhas, colapso suave. Confirma abandonar GSAP? (`+0 KB`, `+0 deps` — argumento forte)
2. **Cor de destaque secundário**: **aqua** (`#0EA5E9`) ou **laranja** (`#F97316`)? Ápice usa os dois em momentos diferentes — proponho aqua como accent padrão + laranja só em badges de alerta crítica.
3. **Logo textual**: manter "XPTO" ou rebatizar como "Ápice" / "Thera"? Proponho manter "XPTO" (não é uma reescrita de domínio), só trocar grafia.
4. **Tipografia**: o briefing cita Roboto/Open Sans/Helvetica. Projeto atual usa **Inter** (versão métrica equivalente, já em uso). Trocar para Roboto é trivial (`swap de 1 linha em @import`). Vale o trabalho?
5. **Sidebar colapsada**: incluir **neste** ticket (passo 5) ou abrir ticket 20 à parte? Eu recomendo incluir — é uma linha de código de estado + 2 classes condicionais.
6. **Tickets 13/14a/14b/15a/15b/16/17/18/19** (todos abertos, nenhum relacionado a visual): a rebrand **vai tocar os mesmos arquivos** que esses tickets mexem (AppLayout, OVNew, OVList). Concorda em **resolver a rebrand primeiro** e atacar os outros depois, re-resolvendo conflitos? Alternativa: fechar tickets pendentes primeiro.

---

**Próxima ação do usuário**: responder às 6 questões acima. Após aprovação, abrir ticket novo (sugestão: `20-rebrand-light-apice.md`) ou encadear como `01-rebrand-...` na sequência da fronteira.
