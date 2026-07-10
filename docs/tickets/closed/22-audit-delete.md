# Ticket 22 — Auditar DELETE no interceptor (F5)

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum

## Questão

Auditoria de segurança identificou severidade **MEDIUM** em `server.cjs`:

```js
if (
  auditName &&
  !AUDIT_EXCLUDE.includes(entity) &&
  (method === "POST" || method === "PATCH")   // ← DELETE não entra
)
```

Exclusões de clientes, itens ou tipos de transporte **não geram evento de auditoria**, quebrando a rastreabilidade prometida por `CONTEXT.md`. `curl -X DELETE /clientes/2` apaga sem deixar rastro.

## Restrições YAGNI

- Mesmo interceptor, só estender a condição + payload — sem novo handler
- Sem soft delete — exclusão é física (atual regra do json-server)

## Cenários de aceitação

- [ ] `DELETE /clientes/:id`, `/itens/:id`, `/tiposTransporte/:id` geram evento em `eventosAuditoria` com `acao: "exclusao"`, `estadoAnterior` (JSON do registro), `estadoPosterior: null`
- [ ] `DELETE /ordensVenda/:id` **não** é auditado (mantido na `AUDIT_EXCLUDE` original — regra de negócio: histórico de OV é imutável)
- [ ] Teste de integração: DELETE em cliente gera evento correspondente
- [ ] Doc drift corrigido

## Notas

- A snapshot do estado anterior já está disponível via `req.__before` (injetado no middleware na linha 273).
- Para DELETE: `acao: "exclusao"`, `entidade: <auditName>`, `entidadeId: <id>`, `estadoAnterior: <req.__before>`, `estadoPosterior: null`.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código (`server.cjs:381-396`):**

```js
let acao;
if (method === 'POST') acao = 'criacao';
else if (method === 'PATCH') acao = 'alteracao';
else if (method === 'DELETE')
  acao = 'exclusao'; // ← F5 fechado
else acao = null;
```

`router.render` agora dispara auditoria para **POST + PATCH + DELETE** sobre `clientes`, `tiposTransporte`, `itens`. `ordensVenda` continua na `AUDIT_EXCLUDE` (regra de negócio: histórico de OV é imutável).

Para DELETE: `acao: "exclusao"`, `estadoAnterior` parseado de `req.__before` (snapshot completo do registro antes da exclusão), `estadoPosterior: null`, `detalhes: "{Nome} {id} excluído"`.

**Verificação:** `tests/integration/server.test.ts:362-396` (describe `"DELETE auditado (F5)"`) — 2 testes:

- DELETE em `/clientes/:id` gera evento com `acao=exclusao`, `estadoAnterior` não-nulo, `estadoPosterior=null` ✓
- DELETE em `/ordensVenda/:id` **não** cria evento de exclusão (regra preservada) ✓
