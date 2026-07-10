# Ticket 16 — Testes de integração do server.cjs

- **Tipo:** `wayfinder:quality`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

CONTEXT.md (linhas 286-294) exige:

> Implementar, no mínimo: 2 testes unitários; 1 teste de integração.

O projeto tem 6 unit tests ✅ mas **zero integration tests** ❌. A camada `server.cjs` tem lógica de negócio rica (idempotency, transição de status, cliente ativo, auditoria) que não está coberta. Hoje qualquer regressão no servidor passa despercebida até bater em produção (ou em E2E flake).

## Restrições YAGNI

- Sem framework novo — Vitest puro + `node:child_process` para spawn do servidor, OU `supertest`/fetch direto contra o servidor em memória
- Sem cobertura 100% — cobrir os 4 fluxos críticos abaixo, ponto
- Cada teste é independente (limpa o `data/db.json` em `beforeEach` ou usa arquivo temp)

## Cenários de aceitação

- [ ] Suite `tests/integration/server.test.ts` (ou `.test.cjs` se necessário)
- [ ] **Cenário 1 — Idempotency replay:** dois POSTs com mesmo `Idempotency-Key` retornam o mesmo body; segundo retorna 200 (não 201)
- [ ] **Cenário 2 — Transição inválida:** PATCH com `status` pulando um step (ex: CRIADA → AGENDADA) retorna 422 com `transicoesValidas` listadas
- [ ] **Cenário 3 — Cliente inativo:** POST `/ordensVenda` com `clienteId` de cliente `ativo: false` retorna 400
- [ ] **Cenário 4 — Audit event gerado:** POST `/ordensVenda` cria um registro em `eventosAuditoria` com `acao: "criacao"`, `entidade: "ordemVenda"`, `estadoAnterior: null`, `estadoPosterior: "CRIADA"`
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final (atualizar contagem de testes)

## Notas

- Abordagem recomendada: usar `supertest` (já maduro, sem setup complexo) + um `server.cjs` em modo "test" que aceita `DATA_FILE` como variável de ambiente, permitindo apontar para um temp file.
- Alternativa mais simples: importar `server.cjs` direto e usar `supertest(server)` em vez de subir um subprocess.
- Após 14a: adicionar cenário **5 — Transporte não autorizado** retorna 400.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Suite criada:** `tests/integration/server.test.ts` — 7 testes em 4 describe blocks.

**Abordagem escolhida:** spawn do `server.cjs` em subprocesso com `DATA_FILE` apontando para tempdir (isolamento do volume Docker). Cada teste é independente — `beforeAll` roda uma vez, `afterAll` mata o processo e limpa o tempdir.

**Cenários cobertos (todos os 4 do ticket + extras pós-14a):**

1. ✅ **Cliente inativo** — POST com `clienteId: "3"` (Gamma) retorna 400 com `error` matching `/inativo/i`.
2. ✅ **Transporte não autorizado** — POST com `clienteId: "2"` + `transporteId: "1"` (Beta só aceita [2]) retorna 400 com `transportesAutorizados: ["2"]` no body.
3. ✅ **Idempotência** — dois POSTs com mesmo `Idempotency-Key`: primeiro 201, segundo 200, mesmo `id` no body.
4. ✅ **Transição inválida** — PATCH `CRIADA → AGENDADA` (salto) retorna 422 com `transicoesValidas: ["PLANEJADA"]`.
5. ✅ **Transição válida** — PATCH `CRIADA → PLANEJADA` retorna 200 e atualiza o `status`.
6. ✅ **Auditoria em criação** — POST de OV gera evento com `acao: "criacao"`, `estadoAnterior: null`, `estadoPosterior: "CRIADA"`, `usuario` refletindo `x-user` header.
7. ✅ **OV válida é criada** — POST happy path com Alpha + transporte 1 retorna 201, status `CRIADA`, valor total correto.

**Verificação:** `npm test` → 16/16 (9 unit + 7 integration).
