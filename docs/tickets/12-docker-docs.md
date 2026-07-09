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

*[a preencher quando resolvido]*