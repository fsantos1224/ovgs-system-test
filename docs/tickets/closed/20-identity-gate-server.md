# Ticket 20 — Gate de identidade no server.cjs (F1)

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum

## Questão

Auditoria de segurança (`AGENTS.md` artifact `security-auditor`) identificou severidade **CRITICAL** no `server.cjs`:

```js
usuario: req.headers['x-user'] || 'admin';
```

O header `x-user` é aceito sem validação e — pior — quando ausente, o log de auditoria **default para `"admin"`**, corrompendo a rastreabilidade (entrega mínima exigida por `CONTEXT.md`).

Trust total no header + default admin permite:

- Atribuição falsa de ações a qualquer usuário
- Ações fantasmas "como admin" sem nenhuma credencial
- Bypass de qualquer checagem de identidade futura

## Restrições YAGNI

- Sem JWT/OAuth neste ticket (escopo MVP). Só **bloquear requests anônimas** e **remover fallback `"admin"`**.
- Manter compatibilidade com testes E2E e de integração (que setam `x-user` explicitamente).

## Cenários de aceitação

- [ ] `server.cjs` recusa (401) qualquer request sem `x-user` em rotas que mutam (`POST /ordensVenda`, `PATCH`, `DELETE`, qualquer CRUD auditável)
- [ ] O fallback `|| "admin"` é removido de todas as 4 ocorrências — substituído por string sentinela `"anonimo"` em caso de bypass autorizado (não deve ocorrer em produção)
- [ ] Endpoints `GET` read-only (listagens) continuam aceitando request anônima para não quebrar o json-server padrão (`GET /clientes` etc.)
- [ ] Teste de integração novo: POST sem header retorna 401; PATCH sem header retorna 401
- [ ] Doc drift corrigido (README + MAP)

## Notas

- Implementação: middleware `app.use((req, res, next) => { /* checar método mutante + presença de x-user */ })` antes do `router`.
- Lista de métodos mutantes: `POST`, `PUT`, `PATCH`, `DELETE`.
- Acompanhar o ticket 22 (DELETE audit) — mesma rota pode ser envolvida pelo gate.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código (`server.cjs`):**

- **L. 76-89** — middleware `MUTANT_METHODS` rejeita POST/PUT/PATCH/DELETE sem header `x-user` (string 1-128 chars) → **401** com `{ error: "Identidade obrigatória..." }`. Endpoints read-only (GET) continuam abertos.
- Helper `validatorUser(req)` em L. 264 — substitui os 4 `req.headers["x-user"] || "admin"` por fallback explícito `"anonimo"` (string sentinela; só ocorre em casos de bypass intencional no qual tudo bem cair como anônimo).
- Auditoria agora reflete o usuário **real** (`server.cjs:158, 204, 246, 314` foram removidas e reapontadas para `validatorUser(req)`).

**Verificação:** suite `tests/integration/server.test.ts` cobre 4 cenários novos no describe `"Identity gate (F1)"`:

- POST sem `x-user` → 401
- PATCH sem `x-user` → 401
- GET sem header → 200 (read-only continua aberto)
- POST com `x-user: alice@xpto.local` → usuario em `eventosAuditoria` é `alice@xpto.local`, **não** `admin`
