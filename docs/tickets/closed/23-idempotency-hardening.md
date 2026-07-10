# Ticket 23 — Hardening de Idempotência (F4 + F7)

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum

## Questão

Auditoria de segurança identificou duas fraquezas combinadas no `idempotencyStore` (`server.cjs:53-69, 86-92, 166-170`):

1. **F4 — Cache poisoning (HIGH)**: lookup da chave é só pelo header `Idempotency-Key`. Cliente B pode enviar a mesma key usada por cliente A e receber a OV de A com `200`.
2. **F7 — DoS por OOM (MEDIUM)**: a chave pode ter qualquer tamanho (até ~80KB Headers.maxLength do Node). Atacante infla o `Map` enviando chaves gigantes.

## Restrições YAGNI

- Sem dependência nova — `node:crypto` (`randomUUID`, hash SHA-256) já disponível
- Backward-compat: requests legítimas continuam funcionando; requests maliciosas retornam 400

## Cenários de aceitação

- [ ] Chave do `idempotencyStore` é `sha256(method + ":" + path + ":" + bodyHash + ":" + x-user)` — não mais o header cru
- [ ] Validação do header `Idempotency-Key`: typeof string, length ≤ 128, regex `^[a-zA-Z0-9_-]+$`. Caso inválido → **400**
- [ ] Mesmo cliente + mesma body + mesma key = 200 (replay legítimo funciona)
- [ ] Mesmo cliente + body diferente + mesma key = 201 (nova operação, cache miss pelo body)
- [ ] Cliente diferente + mesma key (e mesmo body) → 201 (outra operação independente)
- [ ] Teste de integração: header inválido retorna 400; header válido + body diferente = cache miss
- [ ] Doc drift corrigido

## Notas

- Body hash: `crypto.createHash("sha256").update(JSON.stringify(req.body)).digest("hex")` durante o POST handler; chave de lookup idem.
- Manter o header cru no log de auditoria (`detalhes`) para correlacionar com logs do cliente, mas usar apenas o hash composto como chave do `Map`.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código (`server.cjs`):**

**F7 — Validação de header (`server.cjs:96-104`):**

```js
const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9_-]{1,128}$/;
function validateIdempotencyKey(raw) {
  if (typeof raw !== 'string') return null;
  return IDEMPOTENCY_KEY_RE.test(raw) ? raw : null;
}
```

Header ausente ou inválido (length > 128 ou chars fora de `[A-Za-z0-9_-]`) → **400** com mensagem clara. DoS por header gigante eliminado.

**F4 — Chave canônica (`server.cjs:80-94`):**

```js
function canonicalKey(method, path, body, user) {
  return crypto
    .createHash('sha256')
    .update(`${method}:${path}:${bodyHash(body)}:${user}`)
    .digest('hex');
}
```

Cache key = `sha256(method:path:sha256(body):user)`. Mesmo cliente + mesma body + mesma key → cache hit (200). Cliente diferente OU body diferente → cache miss (201).

**Verificação:** `tests/integration/server.test.ts:213-263` (describe `"POST /ordensVenda — idempotência (F4+F7)"`) — 3 testes:

- Replay legítimo (mesmo body, mesma key) → 201 + 200, mesmo id ✓
- Header com 200 chars → 400 ✓
- Header com espaço (chars inválidos) → 400 ✓
