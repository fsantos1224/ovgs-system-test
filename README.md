# XPTO — Sistema de Gestão de Ordens de Venda

> Sistema de backoffice para gestão do ciclo de vida de ordens de venda, com controlo de acessos baseado em papéis (RBAC), auditoria e suporte a contentores Docker.

---

## Stack

| Camada            | Tecnologia                            | Justificação                             |
| ----------------- | ------------------------------------- | ---------------------------------------- |
| Runtime           | Node 20 + TypeScript strict           |                                          |
| UI                | React 18 + Vite 8                     | Dev server rápido, HMR nativo            |
| Roteamento        | React Router v6                       | lazy loading + Suspense                  |
| Estilização       | Tailwind CSS v4                       | CSS-first, `@theme` tokens               |
| Formulários       | React Hook Form                       | `useFieldArray` para itens dinâmicos     |
| Data Fetching     | TanStack React Query                  | Cache, refetch automático, paginação     |
| Validação         | Zod                                   | Schemas de formulário + respostas API    |
| Estado (global)   | Zustand                               | Auth, toast, UI (tema/sidebar)           |
| Mock API          | json-server + `server.cjs`            | Middleware custom (validação, auditoria) |
| Testes unitários  | Vitest                                | Nativo Vite, zero config                 |
| Testes integração | Vitest + `node:http`                  | Servidor mock `server.cjs`               |
| Testes E2E        | Playwright                            | `getByRole` nativo, sem Testing Library  |
| Contentorização   | Docker (multi-stage) + docker-compose |                                          |

---

## ADRs (Architecture Decision Records)

### ADR-01: TanStack Query para data fetching

**Contexto:** Múltiplas páginas precisam de dados do servidor com cache, refetch automático e paginação.

**Decisão:** TanStack React Query gerencia cache, loading/error states e paginação em todas as queries. Mutations invalidam queries relacionadas automaticamente. `keepPreviousData` mantém dados visuais durante transições de página.

**Consequências:** Cache partilhado entre páginas, zero fetching duplicado. Menos boilerplate que fetch + useState. Bundle ~5 kB gzip.

### ADR-02: Estado global mínimo com Zustand

**Contexto:** Auth (user/role), toasts e tema UI precisam de estado global acessível em toda árvore de componentes.

**Decisão:** Zustand para 3 stores atómicas (`authStore`, `toastStore`, `uiStore`). Sem Context, sem Provider. Auth persistida em `localStorage` para sobreviver a reload (ponytail: sem persist middleware, 5 linhas manuais).

**Consequências:** Zero re-renders em cascata (Zustand faz selects finos). Stores independentes — auth não depende de UI. Role switcher no sidebar com reload para resetar estado React.

### ADR-03: Zod para validação em duas camadas

**Contexto:** Formulários e respostas da API precisam de validação consistente.

**Decisão:** `src/schemas/` define schemas Zod reutilizados no frontend (`validation.ts`) e na camada de API (`queries/api.ts`). Schemas validam tanto input de formulário quanto respostas do servidor.

**Consequências:** Mesmo schema serve para form + response validation. Erros de tipagem capturados em runtime próximo ao servidor (mau sinal de json-server fora de sync).

### ADR-04: Máquina de estados linear

**Contexto:** Status de OV precisa de transições válidas.

**Decisão:** `STATUS_FLOW = ['CRIADA','PLANEJADA','AGENDADA','EM_TRANSPORTE','ENTREGUE']`. `canTransition(a,b)` compara índices adjacentes. Linear — sem bifurcações, sem cancelamento. Regra validada tanto no frontend (UI condicional) quanto no servidor (middleware).

**Consequências:** Lógica de transição em O(1) e imutável. Frontend só exibe botões de transição válida. Servidor rejeita 422 se algo passar. Se um dia o domínio exigir cancelamento ou reabertura, a máquina passa a grafo.

### ADR-05: RBAC cumulativo por hierarquia

**Contexto:** 4 papéis (viewer < operator < manager < admin) com permissões granulares.

**Decisão:** `PERMISSOES_POR_ROLE` mapeia permissões literais por role. `getPermissoes()` acumula permissões baseado na hierarquia. `usePermissao()` verifica se a role do utilizador ou qualquer role superior tem a permissão. Role lida do Zustand `authStore` (em memória, sem `localStorage`).

**Consequências:** Admin herda todas as permissões automaticamente. UI condicional esconde elementos que o utilizador não pode usar. Auth persiste ao recarregar (`localStorage`). Sem CASL.

### ADR-06: json-server com middleware custom

**Contexto:** Precisamos de validação de regras de negócio, idempotência e auditoria.

**Decisão:** json-server programático com `server.use()` custom para POST, PATCH e DELETE. Regras de negócio (transporte autorizado, cliente ativo, máquina de estados) validadas no servidor. Idempotency store in-memory com TTL via header `Idempotency-Key`. Auditoria automática em todas as mutações.

**Consequências:** Mock funcional com as mesmas regras que um backend real teria. Store de idempotência bounded (1000 entradas, TTL 1h). Transações simuladas (writes síncronas). Identity gate (`x-user`) em todas as mutações.

### ADR-07: Observabilidade nativa

**Contexto:** Precisamos de métricas de performance e eventos de negócio.

**Decisão:** `PerformanceObserver` para LCP/CLS/INP (3 observers com try/catch). `trackEvent()` escreve para `localStorage` (últimos 100 eventos) e `console.table`. Sem PostHog, Sem Sentry.

**Consequências:** Dados disponíveis para debug sem dependências externas. Eventos rastreados: criação de OV, alteração de status. Sem telemetria remota — `🐴` Aceitável para protótipo.

### ADR-08: Testes em 3 camadas

**Contexto:** O mínimo do desafio são 2 testes unitários + 1 de integração. Buscamos cobertura relevante.

**Decisão:** 3 camadas de teste: (1) **unitários** (Vitest) — lógica de domínio pura (`canTransition`, `canUseTransporte`, `parseBRLtoCents`) + hook `useConfirm` (RTL); (2) **integração** (Vitest + `node:http`) — servidor mock `server.cjs` end-to-end (regras de negócio, idempotência, auditoria, allowlist PATCH, identity gate); (3) **E2E** (Playwright) — fluxos completos (RBAC, criar OV, detalhe, listagem).

**Consequências:** ~15 testes unitários, ~7 de integração, ~18 E2E (incluindo auditoria de CWV em 9 rotas). Cobertura de componentes via RTL + E2E. `🐴` Submissão RHF via Playwright tem limitação conhecida (handleSubmit não reconhece eventos sintéticos).

---

## Modelagem de Domínio

```
Status (máquina linear):
  CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE

Entidades:
  OrdemVenda { id, numero, clienteId, clienteNome, transporte, tipoTransporteId, status,
               itens[{ itemId, nome, quantidade, precoUnitario }], valorTotal,
               dataCriacao, dataEntregaPrevista, janelaAtendimento, observacoes }
  Cliente { id, nome, documento, email, telefone, endereco, ativo, transportesAutorizados[] }
  Item { id, nome, sku, categoria, precoUnitario, unidadeMedida, ativo }
  TipoTransporte { id, nome, modal, ativo }
  EventoAuditoria { id, entidade, entidadeId, acao, usuario, dataHora,
                    estadoAnterior, estadoPosterior, detalhes }

Papéis (RBAC):
  viewer → operator → manager → admin  (hierarquia cumulativa)

Permissões:
  viewer   — listar OVs, clientes, transportes, itens
  operator — + criar/editar OVs, alterar status
  manager  — + editar cadastros, agendar entregas, ver auditoria
  admin    — + gerir utilizadores
```

---

## Estrutura do Projeto

```
src/
├── api/
│   └── fetch.ts           # Wrapper fetch nativo (GET, POST, PATCH, DELETE, paginado)
├── application/           # ← Camada de aplicação (Clean Architecture)
│   ├── ports/             #   Interfaces (repositories) + DTOs
│   └── use-cases/         #   Orquestração de regras de negócio
├── auth/
│   └── credentials.ts     # Credenciais fake de demo
├── components/
│   ├── Modal.tsx          # Modal dialog reutilizável (teclado + foco)
│   ├── Pagination.tsx     # Controlo de paginação server-side
│   └── Toaster.tsx        # Notificações toast (Sonner wrapper)
├── data/
│   └── usuarios.json      # Contas de demo (4 roles)
├── domain/                # ← Camada de domínio (pura, sem framework)
│   ├── entities/          #   Interfaces e funções puras (OrdemVenda, Cliente, Item, ...)
│   ├── types.ts           #   Barrel de re-exports
│   └── types.test.ts      #   Testes unitários (Vitest)
├── hooks/
│   ├── useConfirm.tsx     # Modal de confirmação (Context + Modal)
│   │   └── useConfirm.test.tsx  # Teste RTL
│   └── usePermission.ts   # RBAC: usePermissao, permissoesPorRole
├── infrastructure/        # ← Camada de infraestrutura (adapters)
│   └── repositories/      #   Implementações concretas dos ports
├── layouts/
│   └── AppLayout.tsx      # Sidebar + skip-to-content + role switcher + toaster
├── lib/
│   ├── id.ts              # Geração/validação de UUID
│   ├── money.ts           # parseBRLtoCents
│   │   └── money.test.ts  # Testes unitários
│   ├── telemetry.ts       # PerformanceObserver + trackEvent
│   └── validation.ts      # Schemas Zod para formulários
├── pages/
│   ├── Login.tsx          # Login fake (demo)
│   ├── Dashboard.tsx      # KPIs com indicadores
│   ├── OVList.tsx         # Listagem com filtros + paginação
│   ├── OVDetail.tsx       # Detalhe + transição de status + agendamento
│   ├── OVNew.tsx          # Criação (React Hook Form + useFieldArray)
│   ├── Agendamento.tsx    # Central de agendamento
│   ├── Clientes.tsx       # CRUD clientes (busca + paginação + consulta/edição)
│   ├── Transportes.tsx    # CRUD tipos de transporte (busca + paginação + consulta/edição)
│   ├── Itens.tsx          # Criar/Consultar itens (busca + paginação + consulta)
│   ├── Auditoria.tsx      # Log de eventos de auditoria
│   └── NotFound.tsx       # Página 404
├── queries/
│   ├── api.ts             # Cliente API com validação Zod de respostas
│   ├── queryClient.ts     # Config TanStack Query
│   ├── useOrdensVenda.ts  # Query/mutation OVs (consome use cases)
│   ├── useClientes.ts     # Query/mutation clientes
│   ├── useTransportes.ts  # Query/mutation transportes
│   ├── useItens.ts        # Query/mutation itens
│   ├── useAuditoria.ts    # Query eventos de auditoria
│   └── useAgendamento.ts  # Hook que consome AgendarEntregaUseCase
├── schemas/
│   ├── index.ts           # Re-export
│   ├── ordemVenda.ts      # Schema Zod OV
│   ├── cliente.ts         # Schema Zod cliente
│   ├── transporte.ts      # Schema Zod transporte
│   ├── item.ts            # Schema Zod item
│   └── auditoria.ts       # Schema Zod auditoria
├── stores/
│   ├── authStore.ts       # Zustand: auth (user, login, logout)
│   ├── toastStore.ts      # Zustand: toasts
│   └── uiStore.ts         # Zustand: tema, sidebar, menu mobile
├── App.tsx                # Rotas com lazy loading + Suspense
├── main.tsx               # Entry point
├── index.css              # Tailwind v4 @theme + tokens + scrollbar
└── vite-env.d.ts          # Tipos Vite

server.cjs          # json-server programático com middleware de negócio
db.seed.json        # Seed versionado (25 OVs, 3 clientes, 3 transportes, 10 itens)
data/db.json        # Runtime gerado pelo json-server (ignorado no git)
nginx.conf          # Config nginx para SPA routing + proxy reverso /api/
Dockerfile          # Multi-stage build (node:22-alpine → nginx:alpine)
docker-compose.yml  # frontend + api
```

---

## Como Executar

### Local (tudo num comando)

```bash
npm install
npm run dev:full     # Vite (frontend) + json-server (API) em paralelo
open http://localhost:5173
```

O `dev:full` usa o `concurrently` para levantar ambos os servidores no mesmo terminal. A API fica em `http://localhost:3001` e o frontend em `http://localhost:5173`.

### Local (terminais separados)

```bash
npm install
npm run mock:api    # Terminal 1: json-server em :3001
npm run dev         # Terminal 2: Vite dev em :5173
open http://localhost:5173
```

### Docker

```bash
docker compose up --build
open http://localhost:8080
```

O Docker levanta dois contentores: `api` (json-server em `:3001`) e `frontend` (nginx servindo o build de produção em `:8080`, com proxy reverso para `/api/`).

### Testes

```bash
npm test            # Vitest — unitários + integração (servidor mock)
npm run test:e2e    # Playwright (E2E) — levanta servidores automaticamente via webServer
```

---

## Credenciais de Demo

As contas de login são **fake data** em `src/data/usuarios.json`:

| Email               | Senha       | Role     |
| ------------------- | ----------- | -------- |
| admin@XPTO.local    | admin123    | admin    |
| manager@XPTO.local  | manager123  | manager  |
| operator@XPTO.local | operator123 | operator |
| viewer@XPTO.local   | viewer123   | viewer   |

Não é autenticação real — o json-server não valida senhas. O login é uma simulação de front-end para demonstrar RBAC. Ver limitações de segurança abaixo.

---

## Estratégia de Persistência

- **`db.seed.json`** — template versionado no git; ponto de partida dos dados mock.
- **`data/db.json`** — ficheiro de runtime em memória persistente (ignorado no `.gitignore` e `.dockerignore`); o `server.cjs` copia o `db.seed.json` para cá no primeiro boot se não existir.
- **`idempotencyStore`** — `Map` em memória no processo `server.cjs`. Reseta ao reiniciar.
- **TanStack Query cache** — dados do servidor em memória (volátil, recria ao recarregar).
- **Zustand stores** — auth profile persistido em `localStorage` (sobrevive a reload); UI (tema, sidebar) em memória.

---

## Considerações de Performance

- **TanStack Query** — cache automático, refetch apenas quando necessário, `keepPreviousData` durante paginação
- **Lazy loading** (`React.lazy` + Suspense) em todas as rotas — cada página é um chunk separado
- **Debounce de 300ms** nos filtros de pesquisa (OVs + cadastros)
- **Paginação server-side** (json-server `_page` + `_limit` + `X-Total-Count`)
- **Performance Observer** nativo para LCP/CLS/INP (W3C compliant)
- **Bundle splitting** — Vite `manualChunks` separa react, react-router-dom e vendors
- **Tailwind CSS v4** — sem runtime CSS, purgado em produção
- **Zustand** — selects finos evitam re-renders em cascata

---

## Segurança

### Defesas implementadas

- **CORS restrito** — apenas origens do frontend (`localhost:5173/4173/8080`)
- **CSP no `index.html`** — `default-src 'self'`, sem `frame-ancestors`, sem `unsafe-eval`
- **Headers nginx** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `server_tokens off`
- **Identity gate** — servidor exige header `x-user` em todas as mutações (retorna 401 se ausente)
- **Allowlist de campos em PATCH** — apenas campos permitidos por entidade (F3)
- **Idempotency store com TTL** — chaves expiram em 1h; máximo 1000 entradas; bounded, evita DoS
- **`NODE_ENV=production` no Docker** — sem stack traces em runtime
- **localStorage para auth** — perfil do usuário guardado em `localStorage` (chave `xpto:auth:user`); apenas dados públicos de mock, sem token real
- **Auditoria em DELETE** — cada exclusão é registada com utilizador e estado anterior
- **Container API como root apenas onde necessário**; nginx master/workers separados
- **CSP via meta tag + nginx add_header** — defesa em profundidade

---

## Trade-offs e Limitações

| Decisão                                     | Trade-off                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| TanStack Query                              | Cache em memória sem persistência. Zero bundle ~5 kB.                                                        |
| Zustand em vez de Context                   | Stores atómicas sem Provider. Selects finos evitam re-renders.                                               |
| Zod em vez de validação manual              | Schemas centralizados, reutilizados form + API. Bundle ~7 kB.                                                |
| json-server vs backend real                 | Sem persistência relacional, sem auth real. Mas prototipagem instantânea com middleware.                     |
| Store de idempotência in-memory             | Perde-se ao reiniciar o servidor. Bounded por TTL (1h) e tamanho máx. (1000).                                |
| RBAC só no frontend                         | Inerente ao json-server. Documentado como limitação.                                                         |
| Playwright + RTL                            | Testes de componente com RTL + E2E com Playwright. Submissão RHF tem limitação conhecida.                    |
| Autenticação fake (localStorage)            | Simulada para demonstrar RBAC. Sem JWT, sem OAuth. Persistência via localStorage (5 linhas, sem middleware). |
| Web Vitals nativos vs PostHog/Sentry        | Dados apenas no console em dev. Sem telemetria remota.                                                       |
| Docker com `npm install` em vez de `npm ci` | Lockfile incompatível com esbuild linux. `🐴` Aceitável para protótipo.                                      |

---

## Licença

MIT — Projeto de desafio técnico.
