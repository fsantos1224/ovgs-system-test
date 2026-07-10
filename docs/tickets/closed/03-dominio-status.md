# Ticket 3 — Domínio: Entidades + Máquina de Estados

- **Tipo:** `wayfinder:grilling`
- **Bloqueado por:** Ticket 1 - Stack Frontend

## Questão

Como modelar as entidades de domínio (Cliente, OrdemVenda, Item, TipoTransporte, EventoAuditoria) e o fluxo de status da OV no frontend, usando **apenas TypeScript** — sem lib de state machine?

## Restrições YAGNI

- Máquina de estados = um enum + função de transição. Nada mais.
- Sem libs externas (xstate, effector, etc.)
- Sem classes, sem this — tipos e funções puras.

## O que precisa de ser decidido

- Estrutura dos tipos TypeScript para cada entidade
- Enum ou union type para o status (`CRIADA | PLANEJADA | AGENDADA | EM_TRANSPORTE | ENTREGUE`)
- Função `canTransition(from, to): boolean` — valida as regras de negócio
- Como representar relacionamentos (ex: Cliente → TiposTransporte autorizados)
- Estrutura de pastas para os tipos (ex: `src/domain/types.ts`)

## Exemplo de output esperado (ponytail)

```typescript
const STATUS_FLOW = ['CRIADA', 'PLANEJADA', 'AGENDADA', 'EM_TRANSPORTE', 'ENTREGUE'] as const;
type Status = (typeof STATUS_FLOW)[number];

const canTransition = (from: Status, to: Status): boolean => {
  const idx = STATUS_FLOW.indexOf(from);
  return idx >= 0 && STATUS_FLOW[idx + 1] === to;
};
```

## Resolução

_[a preencher quando resolvido]_
