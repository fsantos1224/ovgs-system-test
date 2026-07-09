# Ticket 14a — Transporte autorizado: domain + seed + server

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

CONTEXT.md (linhas 96-98) define a regra central do domínio Cliente:

> Cada cliente poderá possuir uma lista de tipos de transporte autorizados.
> Uma Ordem de Venda somente poderá ser criada caso o tipo de transporte informado esteja previamente autorizado para o cliente selecionado.

Hoje essa regra **não existe em lugar nenhum** do código: `db.json` não tem o campo, `server.cjs` não valida, e `OVNew` mostra todos os transportes. Esta é a *defining rule* do domínio Cliente — sua ausência é uma violação direta da spec.

Este ticket implementa a regra em domain + seed + server. O ajuste de UI (dropdown dependente) vem no ticket 14b.

## Restrições YAGNI

- `🐴` Apenas campo novo em `Cliente` (`transportesAutorizados: string[]`)
- `🐴` Sem refatorar a máquina de estados ou o json-server
- `🐴` Sem permissões novas

## Cenários de aceitação

- [ ] `Cliente` em `src/domain/types.ts` tem `transportesAutorizados: string[]`
- [ ] `db.json` tem o campo em todos os clientes (seed com mapeamentos realistas: Alpha→[1,3], Beta→[2], Gamma→[3], Delta→[1,2,4], Epsilon→[2,4,5])
- [ ] `POST /ordensVenda` em `server.cjs` valida `cliente.transportesAutorizados.includes(body.transporteId)` e retorna **400** com mensagem clara caso contrário
- [ ] Erro do servidor é exibido no `OVNew.tsx` (após integração com ticket 14b; este ticket só garante que o servidor responde 400 corretamente)
- [ ] Unit test para a função pura `canUseTransporte(cliente, transporteId): boolean` em `src/domain/types.ts`
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final

## Notas

- O helper `canUseTransporte` fica em `domain/types.ts` ao lado de `canTransition`, espelhando o mesmo padrão (função pura + fácil de testar).
- A função server-side pode reusar o helper via uma cópia da lógica OU importar o módulo TS (mais complexo — preferir duplicar a verificação simples por enquanto).
- `data/db.json` (runtime) é sobrescrito pelo seed em `db.json` no primeiro boot se não existir — não precisa editar `data/`.

## Resolução

_a preencher ao fechar o ticket_