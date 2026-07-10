# Ticket 12 — Docker + Documentação

- **Tipo:** `wayfinder:task`
- **Bloqueado por:** Ticket 2 — Mock json-server, Ticket 11 — Testes

## Questão

Como containerizar o frontend + json-server e documentar o projeto para entrega do desafio?

## Sub-tarefas

- **Dockerfile** multi-stage (build Vite + nginx/alpine para servir dist)
- **docker-compose.yml** com 2 services: `frontend` (nginx) + `api` (json-server)
- **script db.json** inicial com dados mock (clientes, transportes, itens, OVs de exemplo)
- **npm scripts:** `dev`, `build`, `test`, `test:e2e`, `mock:api`
- **README.md** com: instruções de execução, stack, decisões arquiteturais, modelagem de domínio, trade-offs

## Formato da documentação

- README.md com sections: stack, decisões arquiteturais, modelagem de domínio, estratégia de persistência, considerações de performance, trade-offs, instruções de execução
- Cada decisão arquitetural com justificação e trade-offs assumidos (ADRs inline no README, não ficheiros separados — YAGNI)

## Resolução

### Decisão

- Dockerfile multi-stage (node:20-alpine → npm build → nginx:alpine + dist)
- nginx.conf minimalista com `try_files` para SPA routing
- docker-compose.yml com 2 services: `api` (node server.cjs) + `frontend` (nginx construído)
- README.md com: stack, 8 ADRs inline, modelagem de domínio, estrutura de pastas, instruções npm/Docker, estratégia de persistência, performance, trade-offs
- Build usa `npm install` (não `npm ci`) porque vitest puxa esbuild@0.28 que não está no lockfile gerado em macOS

### Artefactos

- `Dockerfile` — multi-stage build, produção ~50MB
- `docker-compose.yml` — `docker compose up --build` expõe frontend em :8080 e API em :3001
- `nginx.conf` — SPA routing sem proxy (frontend chama API_BASE diretamente)
- `.dockerignore` — node_modules, dist, .git, *.md
- `README.md` — documentação completa do projeto
