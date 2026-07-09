# Ticket 24 — Migração de IDs para UUID

- **Tipo:** `wayfinder:refactor`
- **Bloqueado por:** Nenhum

## Questão

Atualmente todos os IDs do projeto (`clientes.id`, `tiposTransporte.id`, `itens.id`, `ordensVenda.id`, `eventosAuditoria.id`, e os relacionais `clienteId`, `transporteId`, `itemId`, `entidadeId`) são strings curtas (`"1"`, `"2"`, `"abc-123"`), geradas por `length + 1` no servidor ou hardcoded no seed. Como **pattern**, todo `id` deve ser UUID v4 gerado por `crypto.randomUUID()`.

Benefícios:
- IDs não-enumeráveis (zero enumeration attack via `/clientes/1`, `/clientes/2`...)
- Geração distribuída (cliente + servidor) sem coordenação
- IDs estáveis entre ambientes (não dependem de contadores locais)
- Compatibilidade com merge de bancos no futuro

## Restrições YAGNI

- `🐴` UUID v4 via `crypto.randomUUID()` (nativo, sem lib)
- `🐴` Tipos TypeScript permanecem `string` — só garantimos o pattern no servidor (validação por regex `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
- `🐴` Não trocar `numero` da OV (continua `OV-2024-0001` — display key, diferente do `id` interno)

## Cenários de aceitação

- [ ] Helper `src/lib/id.ts` com `newId()` que encapsula `crypto.randomUUID()`
- [ ] `db.seed.json` regenerado com UUIDs consistentes (cross-references preservadas): os 5 clientes, 5 tipos de transporte, 10 itens, 26 OVs e 6 auditorias
- [ ] `server.cjs`:
  - Gera UUID em novos `POST /ordensVenda` (OV + cada item dentro + log de auditoria)
  - Gera UUID em `POST /clientes`, `/itens`, `/tiposTransporte` (via interceptor)
  - IDs referenciais em body (`clienteId`, `transporteId`, `itemId`) devem ser UUIDs válidos — caso contrário 400
  - Validação `isUUID(id)` em rotas `/:id` (GET/PATCH/DELETE por id direto)
- [ ] Testes de integração atualizados para usar UUIDs reais (carregados via `GET /clientes` no `beforeAll` em vez de hardcoded `"1"`, `"2"`)
- [ ] E2E `ov-create.spec.ts` e `ov-list-filters.spec.ts` atualizados para usar UUIDs via fetch inicial
- [ ] Nenhuma referência hardcoded a IDs numéricos em `src/` ou `e2e/`
- [ ] Doc drift corrigido

## Notas

- Script de regeneração: `node -e "require('./db.seed.json'); ..."` com `crypto.randomUUID()` — rodar uma vez, commitar resultado.
- Geração de IDs referenciais: trocar `String(ordens.length + 1)` por `crypto.randomUUID()`. Para `itens` dentro de OV (linhas embutidas), também UUID por item.
- O impacto em testes é alto (5+ arquivos de teste afetados) mas mecânico — buscar `selectOption("1")` → substituir por `selectOption(<uuid>)` carregado via API no `beforeEach`.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**1. Helper `src/lib/id.ts`** — `newId()` wrapper sobre `crypto.randomUUID()` (nativo) + `isUUID()` guard com regex UUID v4.

**2. `db.seed.json` regenerado** com UUIDs consistentes:
- 5 clientes com UUIDs novos
- 5 transportes com UUIDs novos
- 10 itens com UUIDs novos
- 26 OVs: `id`, `clienteId`, `transporteId` = UUIDs; **28 itens dentro de OV** agora têm `id` UUID próprio (além de `itemId` referencial)
- `transportesAutorizados` em cada cliente re-mapeado do array antigo `["1","3"]` para os UUIDs correspondentes (mapeamento preservado pelo nome: Alpha→Transportadora+Rápida+Navtec etc.)

**3. `server.cjs`** (UUID + related):
- Validador `isUUID()` no topo (L. 12-14)
- Gerador `newId()` no topo (L. 15)
- **L. 226** — POST `/ordensVenda` valida que `clienteId`, `transporteId` e `item.itemId` são UUIDs (400 caso contrário) e que itens referenciados existem
- **L. 234-249** — OV criada usa `id: newId()`; cada item ganha `id: newId()`
- **L. 287-301** — PATCH `/ordensVenda/:id` valida UUID do path param e do `transporteId` no body
- **L. 168** — middleware antes do router substitui `req.body.id = newId()` em POST de entidade auditável (evita que o json-server use auto-increment `"1"`, `"2"`...)
- 6 ocorrências de `String(length + 1)` → `newId()` em eventos de auditoria

**4. Tests atualizados**:
- `tests/integration/server.test.ts` (vitest): novo `beforeAll` carrega IDs via `fetch('/clientes')`, `/tiposTransporte`, `/itens`. Nenhum "1", "2", "3" hardcoded. Helpers `ids.alphaId`, `ids.betaId`, `ids.itemId`, etc.
- `e2e/ov-create.spec.ts` (playwright): `test.beforeAll({request})` carrega UUIDs e armazena em `alphaId`, `betaId`, `alphaTransporteId`, `itemId` para uso nos testes
- `e2e/ov-detail.spec.ts`: pega `id` real da primeira OV via API; 404 usa UUID artificial `00000000-...`

**5. Type `ItemOV`** em `src/domain/types.ts:73-79` ganhou `id: string` (UUID) além de `itemId`. `OVNew.tsx:101-104` gera UUID via `newId()` para cada item antes de submeter.

**6. Validação**:
- `npm test` → **28/28** passando (9 unit + 19 integration)
- `npm run test:e2e` → **9/9** passando
- `npm run build` → OK (sem warning de TS)
