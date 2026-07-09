# OVGS — Sistema de Gestão de Ordens de Venda

> Sistema de backoffice para gestão do ciclo de vida de ordens de venda, com controlo de acessos baseado em papéis (RBAC), auditoria e suporte a contentores Docker.

---

## Stack

| Camada | Tecnologia | Justificação |
|---|---|---|
| Runtime | Node 20 + TypeScript strict | |
| UI | React 18 + Vite 5 | Dev server rápido, HMR nativo |
| Roteamento | React Router v6 | lazy loading + Suspense |
| Estilização | Tailwind CSS v3 | Utilitário, sem runtime CSS |
| Formulários | React Hook Form | `useFieldArray` para itens dinâmicos |
| Mock API | json-server + `server.cjs` | Prototipagem rápida com middleware custom |
| Testes unitários | Vitest | Nativo Vite, zero config |
| Testes E2E | Playwright | `getByRole` nativo, sem Testing Library |
| Contentorização | Docker (multi-stage) + docker-compose | |

---

## ADRs (Architecture Decision Records)

### ADR-01: Zero dependências externas desnecessárias

**Contexto:** É tentador adicionar TanStack Query, Zustand, Zod, shadcn/ui, PostHog, CASL.

**Decisão:** Nenhuma das anteriores. Fetch nativo, `useState`/`useEffect`, validação manual, Tailwind puro, observabilidade nativa, RBAC caseiro.

**Consequências:** Menos bundle, zero breaking changes externos, código mais explícito. `🐴` Marca compensações intencionais (ex.: sem optimistic updates, sem refetch automático).

### ADR-02: Estado local com refreshKey, não global

**Contexto:** Múltiplas páginas precisam de dados do servidor.

**Decisão:** Cada página declara `useFetch()`/`usePaginatedFetch()` com `refreshKey` para refetch. Sem Context/Redux/Zustand.

**Consequências:** Dados duplicados em memória se duas páginas montadas ao mesmo tempo (não acontece com lazy loading). Simplicidade máxima.

### ADR-03: Máquina de estados linear

**Contexto:** Status de OV precisa de transições válidas.

**Decisão:** `STATUS_FLOW = ['CRIADA','PLANEJADA','AGENDADA','EM_TRANSPORTE','ENTREGUE']`. `canTransition(a,b)` compara índices adjacentes. Linear — sem bifurcações, sem cancelamento.

**Consequências:** Lógica de transição em O(1) e imutável. Se um dia o domínio exigir cancelamento ou reabertura, a máquina passa a grafo.

### ADR-04: RBAC cumulativo por hierarquia

**Contexto:** 4 papéis (viewer < operator < manager < admin) com permissões granulares.

**Decisão:** `PERMISSOES_POR_ROLE` mapeia permissões literais por role. A função `can()` verifica se a role do utilizador ou qualquer role superior tem a permissão. Role persistida em `localStorage`.

**Consequências:** Admin herda todas as permissões automaticamente. UI condicional (`usePermissao()`) esconde elementos que o utilizador não pode usar. Sem CASL, sem guardas de rota no servidor.

### ADR-05: json-server com middleware custom

**Contexto:** Precisamos de validação de regras de negócio, idempotência e auditoria.

**Decisão:** json-server programático com `server.use()` custom para POST e PATCH. Idempotency store in-memory via header `Idempotency-Key`. Auditoria escrita inline nas mesmas chamadas.

**Consequências:** Mock funcional sem backend real. Store de idempotência volatiliza ao reiniciar. Transações simuladas (writes síncronas).

### ADR-06: Idempotência no POST de criação

**Contexto:** O formulário pode ser submetido duas vezes por acidente (duplo clique, rede lenta).

**Decisão:** `crypto.randomUUID()` gera `Idempotency-Key` em cada submissão. O servidor retorna 200 se a key já foi processada, 201 se é nova.

**Consequências:** Zero OVs duplicadas mesmo com submissão simultânea. Store in-memory — reseta ao reiniciar o servidor.

### ADR-07: Observabilidade nativa

**Contexto:** Precisamos de métricas de performance e eventos de negócio.

**Decisão:** `PerformanceObserver` para LCP/CLS/INP. `trackEvent()` escreve para `localStorage` (últimos 100 eventos) e `console.table`. Sem PostHog, Sem Sentry.

**Consequências:** Dados disponíveis para debug sem dependências externas. Sem telemetria remota — `🐴` Aceitável para protótipo.

### ADR-08: Testes sem RTL / Testing Library

**Contexto:** O mínimo do desafio são 2 testes unitários + 1 E2E.

**Decisão:** Vitest para lógica de domínio pura (funções `canTransition`, `statusLabel`). Playwright para E2E com `webServer`. Sem RTL, sem Testing Library — `getByRole` nativo do Playwright é suficiente.

**Consequências:** 6 testes unitários + 3 E2E. Cobertura de componentes via E2E apenas. `🐴` Submissão de formulário RHF via Playwright tem uma limitação conhecida.

---

## Modelagem de Domínio

```
Status (máquina linear):
  CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE

Entidades:
  OrdemVenda { id, numero, cliente, transporte, status, itens[], valorTotal, datas, observacoes }
  Cliente { id, nome, documento, email, telefone, ativo }
  Item { id, nome, sku, categoria, precoUnitario, unidadeMedida }
  TipoTransporte { id, nome, modal, ativo }
  EventoAuditoria { id, entidade, entidadeId, acao, usuario, dataHora, detalhes }

Papéis (RBAC):
  viewer → operator → manager → admin  (hierarquia cumulativa)
```

---

## Estrutura do Projeto

```
src/
├── api/fetch.ts           # Wrapper fetch nativo (GET, POST, PATCH, DELETE, paginado)
├── components/
│   └── Pagination.tsx     # Controlo de paginação reutilizável
├── domain/types.ts        # Interfaces, máquina de estados, helpers
│   └── types.test.ts      # Testes unitários (Vitest)
├── hooks/
│   ├── useFetch.ts        # GET simples com loading/error
│   ├── usePaginatedFetch.ts  # GET com paginação (X-Total-Count)
│   └── usePermission.ts   # RBAC: usePermissao, useRole, setRole
├── layouts/AppLayout.tsx  # Sidebar + skip-to-content + role switcher
├── lib/telemetry.ts       # PerformanceObserver + trackEvent
├── pages/
│   ├── OVList.tsx         # Listagem com filtro + paginação
│   ├── OVDetail.tsx       # Detalhe + transição de status
│   ├── OVNew.tsx          # Criação (React Hook Form)
│   ├── Agendamento.tsx    # (placeholder)
│   ├── Clientes.tsx       # Tabela de clientes
│   ├── Transportes.tsx    # Tabela de transportes
│   ├── Itens.tsx          # Tabela de itens
│   ├── Auditoria.tsx      # Log de eventos
│   └── Dashboard.tsx      # Dashboard (placeholder)
├── App.tsx                # Rotas com lazy loading + Suspense
└── main.tsx               # Entry point

server.cjs      # json-server programático com middleware de negócio
db.json         # Dados mock (25 OVs, 3 clientes, 3 transportes, 5 itens)
nginx.conf      # Config nginx para SPA routing
Dockerfile      # Multi-stage build
docker-compose.yml  # frontend + api
```

---

## Como Executar

### Local (npm)

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

### Testes

```bash
npm test            # Vitest (unitários)
npm run test:e2e    # Playwright (E2E) — levanta servidores automaticamente
```

---

## Estratégia de Persistência

- **`db.json`** — ficheiro JSON plano, lido/escrito pelo json-server.
- **`idempotencyStore`** — `Map` em memória no processo `server.cjs`. Reseta ao reiniciar.
- **`localStorage`** — role do utilizador (`ovgs:role`) e eventos de telemetria.
- Sem base de dados real. `🐴` Aceitável para protótipo/desafio.

---

## Considerações de Performance

- lazy loading (`React.lazy` + Suspense) em todas as rotas
- Debounce de 300ms no filtro de pesquisa
- Paginação server-side (json-server `_page` + `_limit` + `X-Total-Count`)
- Performance Observer nativo para LCP/CLS/INP
- Zero bibliotecas de runtime CSS (Tailwind purgado em produção)

---

## Segurança

### Defesas implementadas

- **CORS restrito** — apenas origens do frontend (`localhost:5173/4173/8080`)
- **CSP no `index.html`** — `default-src 'self'`, sem `frame-ancestors`, sem `unsafe-eval`
- **Headers nginx** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `server_tokens off`
- **Idempotency store com TTL** — chaves expiram em 1h; máximo 1000 entradas; evita DoS via keys arbitrárias
- **`NODE_ENV=production` no Docker** — sem stack traces em runtime
- **Container API como root apenas onde necessário**; nginx master/workers separados
- **Seed sem credenciais reais** — `.env.example` usa placeholders
- **CSP via meta tag + nginx add_header** — defesa em profundidade

### Limitações conhecidas (aceitáveis para mock de teste)

Estas são **inerentes à escolha de json-server como mock API** e devem ser tratadas antes de qualquer deploy além de ambiente local:

| Limitação | Por que existe | Mitigação real exigiria |
|---|---|---|
| Credenciais em bundle JS (`VITE_USUARIOS`) | Vite inline variáveis `VITE_*` no build | Mover auth para `server.cjs`, nunca enviar `senha` ao frontend |
| `x-user` header é trust puro | json-server é deliberadamente sem auth | JWT/cookie httpOnly + middleware de validação |
| RBAC só no cliente | Mesma razão acima | Middleware de autorização no servidor |
| Sem TLS no nginx | Docker local | TLS-terminating proxy (Caddy/Traefik) + certificados válidos |
| Sem rate limiting | json-server não tem | `express-rate-limit` em `/auth/login` |
| Sem CSRF defense | Sem cookies/sessões | Quando migrar para cookies, adicionar tokens + `SameSite=Strict` |

Em resumo: o sistema assume **ambiente controlado** (rede interna, Docker local, sem exposição à internet). Não deploy em produção sem substituir json-server por backend real.

---

## Trade-offs e Limitações

| Decisão | Trade-off |
|---|---|
| Fetch nativo vs TanStack Query | Sem cache, sem refetch automático, sem optimistic updates. Mas zero bundle. |
| useState vs Zustand | Sem estado global partilhado. Cada página gere os seus dados. |
| Validação manual vs Zod | Mais código, menos segurança de tipos runtime. Mas zero deps. |
| json-server vs backend real | Sem persistência relacional, sem auth real. Mas prototipagem instantânea. |
| Store de idempotência in-memory | Perde-se ao reiniciar o servidor. Agora bounded por TTL (1h) e tamanho máx (1000). |
| RBAC só no frontend | Inerente ao json-server. Documentado como limitação. |
| Playwright sem RTL | Testes de componente requerem E2E. Submissão RHF tem limitação conhecida. |

---

## Licença

MIT — Projeto de desafio técnico.
