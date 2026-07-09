# Ticket 2 — Mock HTTP: Apenas json-server

- **Tipo:** `wayfinder:grilling`
- **Bloqueado por:** Ticket 1 - Stack Frontend

## Questão

Como estruturar o mock do backend usando **apenas json-server** — sem MSW, sem MirageJS, sem libs adicionais?

## O que precisa de ser decidido

- Estrutura do `db.json` (entidades, relacionamentos, dados iniciais)
- Rotas custom para lógica de negócio (ex: validação de transição de status, transporte autorizado para cliente)
- Como usar routes/middleware custom do json-server (`server.js`) para simular regras de negócio
- Scripts `npm run mock:api` no `package.json`
- Como json-server alimenta os testes E2E com Playwright

## Notas

- json-server suporta `server.js` com middleware custom — permite validar regras de negócio nos mocks.
- `?_page=1&_limit=10` para paginação server-side.
- `_sort`, `_start`, `_end` para queries avançadas.

## Transações e Idempotência

Uma operação como "criar OV" afeta múltiplas entidades (OV + Itens + Auditoria + Estoque). Com json-server (sem transações reais):

- `🐴` **Operações atómicas via middleware custom:** No `server.js`, um único POST para `/api/ovs` é interceptado pelo middleware que executa múltiplas writes no `db.json` dentro de um bloco síncrono — se alguma falha, o middleware retorna erro 500 sem aplicar partial writes.
- `🐴` **Idempotência via UUID + idempotency-key:** Cada requisição de criação de OV inclui um header `Idempotency-Key`. O middleware verifica se a key já foi processada (cache em Map em memória) e retorna o resultado anterior sem re-executar. Isto simula a proteção contra duplicatas sem backend real.
- **Trade-off:** json-server não tem transações nativas. A abordagem com middleware custom é suficiente para demonstração do conceito (e para testes E2E), mas em produção seria necessário um banco relacional com transações ACID.

## Resolução

*[a preencher quando resolvido]*