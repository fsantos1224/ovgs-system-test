# Ticket 15a — Filtrar clientes inativos no dropdown de OV

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

CONTEXT.md define que uma OV só pode ser criada para um cliente válido. O servidor (`server.cjs`) já valida `cliente.ativo === false` e retorna 400. Mas o `OVNew.tsx:127-132` renderiza `<option>` para **todos** os clientes, incluindo inativos. UX ruim: o usuário só descobre a regra ao submeter e ver o erro.

Filtro trivial no dropdown resolve. Cliente inativo continua aparecendo na página `/cadastros/clientes` (esse é o cadastro, faz sentido ver).

## Restrições YAGNI

- `🐴` Só filter no map do dropdown — sem desabilitar/mostrar inativos, sem tooltip

## Cenários de aceitação

- [ ] `OVNew.tsx` renderiza apenas clientes com `ativo: true` no dropdown
- [ ] Cliente `Gamma Distribuidora` (id "3", `ativo: false`) **não aparece** no dropdown de nova OV
- [ ] Cliente `Gamma Distribuidora` **continua aparecendo** na página de Cadastros
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final

## Notas

- Implementação: trocar `clientes?.map(...)` por `clientes?.filter(c => c.ativo).map(...)`.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código (`src/pages/OVNew.tsx:164`):**
```tsx
{clientes?.filter((c) => c.ativo).map((c) => (
  <option key={c.id} value={c.id}>{c.nome}</option>
))}
```

Gamma Distribuidora (id "3", `ativo: false`) **não aparece** no dropdown de nova OV.
Na página `/cadastros/clientes` (`src/pages/Clientes.tsx`), todos os clientes são listados — o cadastro continua mostrando inativos para edição/consulta, alinhado com o ticket.

Mudança de 1 linha, sem libs, sem tooltips (YAGNI). Unit + integration + E2E suites continuam verdes.