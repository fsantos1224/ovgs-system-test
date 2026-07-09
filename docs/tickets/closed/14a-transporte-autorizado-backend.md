# Ticket 14a — Transporte autorizado: domain + seed + server

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

CONTEXT.md (linhas 96-98) define a regra central do domínio Cliente:

> Cada cliente poderá possuir uma lista de tipos de transporte autorizados.
> Uma Ordem de Venda somente poderá ser criada caso o tipo de transporte informado esteja previamente autorizado para o cliente selecionado.

Hoje essa regra **não existe em lugar nenhum** do código: `db.seed.json` não tem o campo, `server.cjs` não valida, e `OVNew` mostra todos os transportes. Esta é a *defining rule* do domínio Cliente — sua ausência é uma violação direta da spec.

Este ticket implementa a regra em domain + seed + server. O ajuste de UI (dropdown dependente) vem no ticket 14b.

## Restrições YAGNI

- `🐴` Apenas campo novo em `Cliente` (`transportesAutorizados: string[]`)
- `🐴` Sem refatorar a máquina de estados ou o json-server
- `🐴` Sem permissões novas

## Cenários de aceitação

- [ ] `Cliente` em `src/domain/types.ts` tem `transportesAutorizados: string[]`
- [ ] `db.seed.json` tem o campo em todos os clientes (seed com mapeamentos realistas: Alpha→[1,3], Beta→[2], Gamma→[3], Delta→[1,2,4], Epsilon→[2,4,5])
- [ ] `POST /ordensVenda` em `server.cjs` valida `cliente.transportesAutorizados.includes(body.transporteId)` e retorna **400** com mensagem clara caso contrário
- [ ] Erro do servidor é exibido no `OVNew.tsx` (após integração com ticket 14b; este ticket só garante que o servidor responde 400 corretamente)
- [ ] Unit test para a função pura `canUseTransporte(cliente, transporteId): boolean` em `src/domain/types.ts`
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final

## Notas

- O helper `canUseTransporte` fica em `domain/types.ts` ao lado de `canTransition`, espelhando o mesmo padrão (função pura + fácil de testar).
- A função server-side pode reusar o helper via uma cópia da lógica OU importar o módulo TS (mais complexo — preferir duplicar a verificação simples por enquanto).
- `data/db.json` (runtime) é sobrescrito pelo seed em `db.json` no primeiro boot se não existir — não precisa editar `data/`.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código:**
1. **`Cliente` em `src/domain/types.ts:36-45`** ganhou `transportesAutorizados: string[]`.
2. **`db.seed.json`** tem o campo em todos os 5 clientes com o mapeamento realista pedido: Alpha→[1,3], Beta→[2], Gamma→[3], Delta→[1,2,4], Epsilon→[2,4,5].
3. **`server.cjs:115-126`** valida `cliente.transportesAutorizados.includes(body.transporteId)` e retorna **400** com `{ error, clienteId, transporteId, transportesAutorizados }`. Backward-compat: clientes sem o campo são tratados como sem autorização.
4. **`canUseTransporte` em `src/domain/types.ts:47-54`** — função pura com semântica defensiva (`null/undefined → false`, fallback para campo ausente).
5. **Unit test em `src/domain/types.test.ts:36-50`** — 3 cenários (presente/ausente/cliente nulo).

**Verificação:** `npm test` → 16/16 (incluindo o teste de integração `tests/integration/server.test.ts:86-103` que valida 400 com lista de autorizados).