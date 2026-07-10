# XPTO Frontend — Wayfinder Map

## Destination

Sistema de gestão de Ordens de Venda (backoffice/ERP) em React 18 + Vite 5 + TypeScript + json-server, com autorização RBAC demonstrando maturidade sénior (UI-level + operação-level), otimizado para observabilidade interna, acessibilidade (a11y) e performance de dashboards.

## Notes

- **Domínio:** Backoffice de logística — gestão de OVs, agendamentos, monitoramento operacional.
- **Stack stack:** React 18 + Vite 5 + TypeScript + React Router v6 + Tailwind CSS + json-server.
- **Princípio YAGNI:** Nada de libs desnecessárias. Nada de abstrações prematuras. Nada de boilerplate.
- **`/🐴`** marca simplificações intencionais.
- Skills: `frontend-design`, `react-patterns`, `a11y-runtime-tester`, `performance-profiling`.

## Decisions so far

### Ticket 1 — Stack Frontend (resolvido)

- **React 18.3** + **Vite 5.4** + **TypeScript 5.6 (strict)** — configurado manualmente
- **React Router v6** — BrowserRouter com 8 rotas aninhadas sob AppLayout
- **Tailwind CSS 3.4** — postcss + autoprefixer
- **json-server 0.17** — mock API em `db.seed.json` (5 recursos)
- **concurrently** — `dev:full` para dev + mock paralelos
- Estrutura `src/{domain,api,hooks,layouts,pages,components}/` criada
- `as const` necessário para manter tipo literal em array de transições (TypeScript strict)
- RBAC: objeto hardcoded + hook `usePermissao` — sem Context/Provider (YAGNI)
- fetch: wrapper minimalista (`apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete` + hook `useFetch`)

### Ticket 5 — Routing e Layout (resolvido)

- Rotas definidas: `/`, `/ovs`, `/ovs/nova`, `/ovs/:id`, `/agendamento`, `/cadastros/clientes`, `/cadastros/transportes`, `/cadastros/itens`, `/auditoria`
- Lazy loading com `React.lazy()` + `Suspense` — todas as páginas carregam sob demanda
- Página 404 (`NotFound.tsx`) para rotas inexistentes
- Sidebar (`AppLayout.tsx`) com NavLink para cada rota, active state visual
- Links internos corrigidos para os novos paths (`/ordens-venda` → `/ovs`)
- Página de Auditoria criada com tabela de eventos

### Ticket 9 — Observabilidade (resolvido)

- `initWebVitals()` no `main.tsx` — Performance Observer nativo para LCP, CLS, INP (3 observers com try/catch)
- `trackEvent()` em `src/lib/telemetry.ts` — eventos de negócio com console.table + localStorage (últimos 100)
- Eventos rastreados: `ov:criar` (OVNew), `ov:status:alterar` (OVDetail)
- Zero dependências, zero SDKs externos

### Ticket 10 — Performance (resolvido)

- `apiGetPaginated()` em `src/api/fetch.ts` — expõe `X-Total-Count` do json-server
- `usePaginatedFetch` hook — gerencia página, filtros, totalPages; reseta página 1 ao mudar filtro
- `Pagination` component — botões Anterior/Próximo, oculta se totalPages <= 1
- `OVList.tsx` atualizada: campo de busca com debounce 300ms + tabela paginada
- `db.seed.json` populado com 25 OVs (demonstra 2 páginas com pageSize=20)

### Ticket 6 — RBAC (resolvido)

- 4 roles: `viewer < operator < manager < admin` — hierarquia cumulativa de permissões
- `PERMISSOES_POR_ROLE` — matriz de autorização declarativa em `usePermission.ts`
- `getPermissoes()` — acumula permissões baseado na hierarquia (mais sénior herda das anteriores)
- Role persistida em localStorage (`XPTO:role`), alterável via `<select>` no sidebar
- Nav items no sidebar escondidos condicionalmente por role
- `setRole()` com `window.location.reload()` para resetar o estado React (simplificação intencional)
- Permissões usadas: `ov:listar`, `ov:criar`, `ov:alterar_status`, `clientes:listar`, `agendamento:ver`, `auditoria:ver`, etc.
- Credenciais de demo movidas de `.env` (`VITE_USUARIOS`) para `src/data/usuarios.json` — fake data explícita, não config sensível

### Ticket 2 — Mock json-server (resolvido)

- `server.cjs` com json-server programático + middleware custom
- `POST /ordensVenda` — valida cliente ativo, campos obrigatórios, cria auditoria automaticamente
- `PATCH /ordensVenda/:id` — valida transição de status (mesma máquina de estados do `STATUS_FLOW`)
- Retorna 422 com sugestões se transição inválida
- Idempotência via header `Idempotency-Key` + Map em memória
- `POST /reset` — limpa cache de idempotência
- `src/api/fetch.ts` — `apiPost` e `apiPatch` parseiam o body de erro para mensagens legíveis
- `OVDetail.tsx` — mostra `erroStatus` inline quando transição é rejeitada (422)
- `OVNew.tsx` — envia `idempotency-key` via `crypto.randomUUID()`

### Ticket 3 — Domínio (resolvido)

- Status alinhados com a especificação: `CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE`
- `STATUS_FLOW` — array `as const` + função `canTransition()` que compara índices
- `server.cjs` e `db.seed.json` atualizados com os novos status
- `OVDetail.tsx`, `OVNew.tsx`, `Agendamento.tsx` — referências de status corrigidas

### Ticket 4 — Estado (resolvido)

- Padrão `useFetch` + `usePaginatedFetch` + `apiGet`/`apiPost`/`apiPatch` — sem TanStack Query, sem Zustand, sem Redux
- `useFetch<T>(path)` — fetch com `useEffect`, `refresh()` via `refreshKey`, cancelamento em unmount
- `usePaginatedFetch<T>(basePath, pageSize)` — paginação server-side com json-server (`_page`, `_limit`, `X-Total-Count`)
- Mutação: `apiPost`, `apiPatch` com parse de erro do json-server middleware
- Refresh após mutação via `.refresh()` — pattern simples sem cache layer
- Estado local em páginas (filters, page, form state) sem Context global

### Ticket 7 — Formulários (resolvido)

- React Hook Form para criação de OV (formulário complexo com itens dinâmicos)
- `useFieldArray` para gestão de lista de itens (adicionar/remover)
- Validação manual inline via função `validate()` pura — sem Zod/Yup
- Botão desabilitado durante `submitting` para evitar duplicatas visuais + `Idempotency-Key` real no POST
- Erro do servidor exibido inline (`server error`)
- Cadastros simples (Clientes, Transportes, Itens) — validação manual via atributos HTML (`required`, `min`)

### Ticket 8 — Acessibilidade (resolvido)

- Skip-to-content link como primeiro elemento focável (sr-only + focus:not-sr-only)
- `role="navigation"`, `aria-label="Navegação principal"`, `aria-label="Menu principal"` no sidebar
- `role="main"` e `id="main-content"` no `<main>`
- `role="alert"` em mensagens de erro do servidor
- `role="status"` + `aria-live="polite"` em todos os loading states
- `aria-label` nos botões de alteração de status e paginação
- `aria-label` no seletor de role
- `focus-visible:outline` em todos os botões e links interativos
- `<caption className="sr-only">` com descrição em todas as tabelas
- `<div role="region" aria-label="...">` envolvendo tabelas de listagem
- Itens sem permissão retornam `null` (não renderizam, não são focáveis)

### Ticket 11 — Testes (resolvido)

- Vitest para **9 testes unitários** de lógica de domínio pura (`canTransition`, `statusLabel`, `canUseTransporte`) + **7 testes de integração** do `server.cjs` (regras de negócio, idempotência, transições, auditoria)
- Playwright para **9 testes E2E** em 4 specs: `rbac.spec.ts` (3), `ov-create.spec.ts` (2), `ov-detail.spec.ts` (2), `ov-list-filters.spec.ts` (2)
- `playwright.config.ts` com `webServer` para json-server + Vite
- Sem RTL, sem Testing Library — Playwright `getByRole` nativo
- `🐴` Submissão RHF via Playwright → `🐴` conhecido: `handleSubmit` não reconhece eventos sintéticos do Playwright. API testada diretamente (funciona), form load testado sem erros JS.

### Ticket 12 — Docker + Docs (resolvido)

- Dockerfile multi-stage (node:20-alpine build + nginx:alpine final)
- nginx.conf com SPA routing (`try_files $uri $uri/ /index.html`)
- docker-compose.yml com `api` (json-server) + `frontend` (nginx)
- `.dockerignore` para excluir node_modules/dist/.git
- README.md completo: stack, 8 ADRs inline, modelagem de domínio, estrutura, instruções (npm + docker), testes, estratégia de persistência, performance, trade-offs
- `🐴` Docker build usa `npm install` em vez de `npm ci` (lockfile incompatível com esbuild linux)

## Tickets

| #      | Ticket                                     | Slug                       | Tipo                  | Bloqueado por |
| ------ | ------------------------------------------ | -------------------------- | --------------------- | ------------- | --- |
| ~~1~~  | Stack Frontend                             | `01-stack-frontend`        | `wayfinder:grilling`  | —             | ✔   |
| ~~5~~  | Routing e Layout                           | `05-routing-layout`        | `wayfinder:prototype` | 1             | ✔   |
| ~~9~~  | Observabilidade                            | `09-observabilidade`       | `wayfinder:research`  | 1             | ✔   |
| ~~10~~ | Performance                                | `10-performance`           | `wayfinder:research`  | 1             | ✔   |
| ~~2~~  | Mock HTTP — Apenas json-server             | `02-mock-json-server`      | `wayfinder:grilling`  | 1             | ✔   |
| ~~3~~  | Domínio — Entidades + Máquina de Estados   | `03-dominio-status`        | `wayfinder:grilling`  | 1             | ✔   |
| ~~4~~  | Estado — useState + fetch nativo           | `04-estado-fetch`          | `wayfinder:grilling`  | 3             | ✔   |
| ~~6~~  | RBAC — Papéis, Permissões e UI condicional | `06-rbac-autorizacao`      | `wayfinder:grilling`  | 1             | ✔   |
| ~~7~~  | Formulários e Validação                    | `07-formularios-validacao` | `wayfinder:grilling`  | 3, 6          | ✔   |
| ~~8~~  | a11y — HTML semântico + ARIA + Tailwind    | `08-acessibilidade`        | `wayfinder:prototype` | 5, 6          | ✔   |
| ~~11~~ | Testes — Vitest + Playwright               | `11-testes`                | `wayfinder:grilling`  | 2, 4, 6       | ✔   |
| ~~12~~ | Docker + Documentação                      | `12-docker-docs`           | `wayfinder:task`      | 2, 11         | ✔   |

## Next frontier (code review 2026-07-09)

Code review contra `CONTEXT.md` + senior-level criteria identificou 9 tickets adicionais. Fecham gaps de spec (transporte-autorizado, integração, visibilidade), bugs concretos (Rules of Hooks, error messages, validate race) e melhorias de senior bar (Web Vitals corretos, bundle splitting, E2E de criar OV).

| #   | Título                                         | Slug                                | Tipo                    | Bloqueado por | Status |
| --- | ---------------------------------------------- | ----------------------------------- | ----------------------- | ------------- | ------ |
| ~~13~~  | Bugs em AppLayout + OVNew                  | `13-bugs-applayout-ovnew`           | `wayfinder:bugfix`      | —             | ✔   |
| ~~14a~~ | Transporte autorizado — domain + seed + server | `14a-transporte-autorizado-backend` | `wayfinder:feature`     | —             | ✔   |
| ~~14b~~ | Transporte autorizado — dropdown dependente    | `14b-transporte-autorizado-ui`      | `wayfinder:feature`     | 14a           | ✔   |
| ~~15a~~ | Filtrar clientes inativos no dropdown de OV    | `15a-clientes-ativos-dropdown`      | `wayfinder:bugfix`      | —             | ✔   |
| ~~15b~~ | Permission gate na página de Auditoria         | `15b-auditoria-permission-gate`     | `wayfinder:bugfix`      | —             | ✔   |
| ~~16~~  | Testes de integração do server.cjs             | `16-testes-integracao-server`       | `wayfinder:quality`     | —             | ✔   |
| ~~17~~  | Web Vitals conforme spec W3C                   | `17-web-vitals-w3c`                 | `wayfinder:quality`     | —             | ✔   |
| ~~18~~  | Bundle splitting + preload hints               | `18-bundle-splitting`               | `wayfinder:performance` | —             | ✔   |
| ~~19~~  | E2E do happy path de criar OV                  | `19-e2e-criar-ov`                   | `wayfinder:quality`     | 13, 14b       | ✔   |
| ~~20~~  | Identity gate no server.cjs (F1)               | `20-identity-gate-server`           | `wayfinder:bugfix`      | —             | ✔   |
| ~~21~~  | Allowlist de campos em PATCH (F3)              | `21-allowlist-patch`                | `wayfinder:bugfix`      | —             | ✔   |
| ~~22~~  | DELETE auditado (F5)                          | `22-audit-delete`                   | `wayfinder:bugfix`      | —             | ✔   |
| ~~23~~  | Hardening de idempotência (F4+F7)              | `23-idempotency-hardening`          | `wayfinder:bugfix`      | —             | ✔   |
| ~~24~~  | Migração de IDs para UUID                      | `24-uuid-migration`                 | `wayfinder:refactor`    | —             | ✔   |
| ~~27~~  | Coluna "Ações" nas tabelas de listagem         | `27-acoes-coluna`                   | `wayfinder:feature`     | —             | ✔   |

### Ticket 27 — Coluna "Ações" nas tabelas de listagem (resolvido)

- Adicionada coluna "Ações" com botão Consultar (Eye) e Editar (Pencil) em Clientes, Transportes, Itens.
- Consultar abre modal read-only com todos os campos do registro.
- Busca textual com debounce 300ms + paginação client-side (10/página) nas 3 tabelas de cadastro.
- Itens não tem Editar (conforme CONTEXT.md).
- Excluir (Trash2) + useConfirm + bulk delete ficaram para futura iteração.

### Ordem de execução sugerida (fronteira)

Tickets 13, 14a, 15a, 15b, 16, 17, 18 podem ser atacados em paralelo (todos sem dependência).
Depois: 14b (depende de 14a) → 19 (depende de 13 + 14b).

### Ordem de execução sugerida (fronteira)

1. Ticket 1 — Stack (grátis, base para todos)
2. Ticket 5 — Routing (só depende de 1)
3. Ticket 9 — Observabilidade (só depende de 1)
4. Ticket 10 — Performance (só depende de 1)
5. Ticket 6 — RBAC (só depende de 1)
6. Ticket 2 — Mock (depende de 1)
7. Ticket 3 — Domínio (depende de 1)
8. Ticket 4 — Estado (depende de 3)
9. Ticket 7 — Formulários (depende de 3, 6)
10. Ticket 8 — a11y (depende de 5, 6)
11. Ticket 11 — Testes (depende de 2, 4, 6)
12. Ticket 12 — Docker + Docs (depende de 2, 11)

## Not yet specified

- PWA / Offline-first para operadores de campo
- i18n para colaboradores
- Real-time no monitoramento (polling vs SSE)
- CI/CD pipeline simples
- Storybook para documentação de componentes

## Out of scope

- Backend real (NestJS, Prisma, DB) — tudo mockado via json-server
- Autenticação real (OAuth/JWT) — mock simples
- WebSockets, mobile nativo, multi-tenancy
- SEO / GEO (sistema interno de backoffice)
