# Ticket 21 — Allowlist de campos em PATCH (F3)

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum

## Questão

Auditoria de segurança identificou severidade **HIGH** em `server.cjs`:

```js
router.db.get('ordensVenda').find({ id }).assign(req.body).write();
```

O json-server repassa `req.body` inteiro no `assign` sem allowlist. Como o servidor não tem RBAC server-side (ticket ainda não existe), um visitante pode sobrescrever campos arbitrários — incluindo `transportesAutorizados` em `/clientes/:id` (revogando/autorizando à vontade).

Mass assignment é independente da decisão "MVP sem auth real" e deve ser fechado mesmo antes do gate de identidade.

## Restrições YAGNI

- Helper único `pick(body, allowlist)` em vez de validador cheio (Zod) — simples e testável
- Sem normalização de tipos — confia no `JSON.parse` + shape nativo

## Cenários de aceitação

- [ ] Helper `pick(body, allowlist)` exportado e testado em `server.cjs` ou util local
- [ ] `PATCH /ordensVenda/:id` aceita apenas `{ status, dataEntregaPrevista, transporteId, observacoes, itens, valorTotal }` — rejeita (drop) chaves extras silenciosamente
- [ ] `PATCH /clientes/:id`, `/itens/:id`, `/tiposTransporte/:id` (via interceptor genérico) seguem allowlist explícita
- [ ] Tentativa de reatribuir `id` ou `clienteId` em PATCH de OV é descartada
- [ ] Teste de integração: PATCH com `{"id": "novo", "clienteId": "outro"}` mantém os IDs originais
- [ ] Doc drift corrigido

## Notas

- Allowlists por entidade:
  - `clientes`: `nome, documento, email, telefone, endereco, ativo, transportesAutorizados`
  - `tiposTransporte`: `nome, modal, ativo`
  - `itens`: `nome, sku, categoria, precoUnitario, unidadeMedida, ativo`
  - `ordensVenda`: `status, dataEntregaPrevista, transporteId, observacoes, itens, valorTotal, janelaAtendimento`
- Imutáveis (sempre removidas do body antes de assign): `id`, `clienteId`, `numero`, `dataEmissao`, `nomeCliente`, `nomeTransporte`.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código (`server.cjs`):**

- **L. 113-125** — `ALLOWLIST_BY_ENTITY` declara campos permitidos por recurso. `id`, `clienteId` e afins não estão em nenhuma allowlist → tentativas são **descartadas silenciosamente** (não retornam erro).
- **L. 126-131** — helper `pick(body, allowlist)` filtra o body.
- **L. 168-176** — middleware antes do `router` aplica `req.body = pick(...)` em PATCH contra `/clientes`, `/tiposTransporte`, `/itens`, `/ordensVenda`.
- **L. 290** — PATCH `/ordensVenda/:id` faz o mesmo dentro do handler para garantir duplo lock.

**Verificação:** `tests/integration/server.test.ts:328-345` (describe `"PATCH /ordensVenda/:id — máquina de estados"`) — envia `{"id": "intruso", "clienteId": "intruso", "observacoes": "..."}` em PATCH:

- `body.id === ovId` (preservado)
- `body.clienteId === ids.alphaId` (preservado)
- `body.observacoes === "tentando bypassar allowlist"` (allowlisted, aplicado)
