# Ticket 46 — Limpeza: remover re-exports antigos + doc drift

**Tipo:** `wayfinder:refactor` (contract — remoção de código morto)

**Bloqueado por:** 40, 42, 43 (precisa que todos os consumers tenham migrado)

## O que construir

Após todos os consumers terem sido migrados para os novos tipos de domínio, repositórios e use cases, remover o que sobrou do expand do ticket 40 e atualizar a documentação.

### Remoções

- Remover re-exports de schemas em `domain/types.ts` se ainda existirem
- Remover quaisquer tipos ou funções duplicadas entre `domain/entities/` e `domain/types.ts`
- Consolidar `domain/types.ts` — se ficou vazio, remover o arquivo (ou manter só como barrel)

### Doc drift

- Atualizar `docs/DESIGN.md` seção 4 — refletir nova estrutura de camadas (domain/entities, application/ports, application/use-cases, infrastructure/repositories)
- Atualizar `docs/MAP.md` com os novos tickets na tabela e sessões "Decisions so far"
- Atualizar `AGENTS.md` se necessário (skills? domain docs?)
- Verificar README.md se menciona estrutura de diretórios

## Critérios de aceitação

- [ ] Nenhum re-export de schema em `domain/`
- [ ] `domain/types.ts` limpo ou removido
- [ ] `docs/DESIGN.md` reflete nova arquitetura
- [ ] `docs/MAP.md` lista tickets 40-46 como resolvidos + "Decisions so far" preenchido
- [ ] `tsc --noEmit` + `vitest run` verdes
- [ ] `npm run build` funciona
