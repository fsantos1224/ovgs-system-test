# OVGS Frontend — Wayfinder Map

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
- **json-server 0.17** — mock API em `db.json` (5 recursos)
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
- `db.json` populado com 25 OVs (demonstra 2 páginas com pageSize=20)

### Ticket 6 — RBAC (resolvido)

- 4 roles: `viewer < operator < manager < admin` — hierarquia cumulativa de permissões
- `PERMISSOES_POR_ROLE` — matriz de autorização declarativa em `usePermission.ts`
- `getPermissoes()` — acumula permissões baseado na hierarquia (mais sénior herda das anteriores)
- Role persistida em localStorage (`ovgs:role`), alterável via `<select>` no sidebar
- Nav items no sidebar escondidos condicionalmente por role
- `setRole()` com `window.location.reload()` para resetar o estado React (simplificação intencional)
- Permissões usadas: `ov:listar`, `ov:criar`, `ov:alterar_status`, `clientes:listar`, `agendamento:ver`, `auditoria:ver`, etc.

### Ticket 2 — Mock json-server (resolvido)

- `server.cjs` com json-server programático + middleware custom
- `POST /ordensVenda` — valida cliente ativo, campos obrigatórios, cria auditoria automaticamente
- `PATCH /ordensVenda/:id` — valida transição de status contra a máquina de estados (`TRANSITIONS`), retorna 422 com sugestões se inválida
- Idempotência via header `Idempotency-Key` + Map em memória
- `POST /reset` — limpa cache de idempotência
- `src/api/fetch.ts` — `apiPost` e `apiPatch` agora parseiam o body de erro para mensagens legíveis
- `OVDetail.tsx` — mostra `erroStatus` inline quando transição é rejeitada (422)
- `OVNew.tsx` — envia `idempotency-key` via `crypto.randomUUID()`

## Tickets

| # | Ticket | Slug | Tipo | Bloqueado por |
|---|---|---|---|---|
| ~~1~~ | Stack Frontend | `01-stack-frontend` | `wayfinder:grilling` | — | ✔
| ~~5~~ | Routing e Layout | `05-routing-layout` | `wayfinder:prototype` | 1 | ✔
| ~~9~~ | Observabilidade | `09-observabilidade` | `wayfinder:research` | 1 | ✔
| ~~10~~ | Performance | `10-performance` | `wayfinder:research` | 1 | ✔
| ~~2~~ | Mock HTTP — Apenas json-server | `02-mock-json-server` | `wayfinder:grilling` | 1 | ✔
| 3 | Domínio — Entidades + Máquina de Estados | `03-dominio-status` | `wayfinder:grilling` | 1 |
| 4 | Estado — useState + fetch nativo | `04-estado-fetch` | `wayfinder:grilling` | 3 |
| ~~6~~ | RBAC — Papéis, Permissões e UI condicional | `06-rbac-autorizacao` | `wayfinder:grilling` | 1 | ✔
| 7 | Formulários e Validação | `07-formularios-validacao` | `wayfinder:grilling` | 3, 6 |
| 8 | a11y — HTML semântico + ARIA + Tailwind | `08-acessibilidade` | `wayfinder:prototype` | 5, 6 |
| 11 | Testes — Vitest + Playwright | `11-testes` | `wayfinder:grilling` | 2, 4, 6 |
| 12 | Docker + Documentação | `12-docker-docs` | `wayfinder:task` | 2, 11 |

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