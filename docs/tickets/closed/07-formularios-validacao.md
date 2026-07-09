# Ticket 7 — Formulários e Validação

- **Tipo:** `wayfinder:grilling`
- **Bloqueado por:** Ticket 3 — Domínio e Máquina de Estados, Ticket 6 — RBAC

## Questão

Qual estratégia para formulários (criação de OV com múltiplos itens, cadastros básicos) e validação de regras de negócio no frontend?

## Restrições YAGNI

- React Hook Form para formulários complexos (OV com itens) — justificável
- `🐴` Validação manual/custom para cadastros básicos — sem Zod, sem Yup, sem libs de schema
- Validação de regras de negócio via função pura (ex: `validateTransporteAutorizado(clienteId, transporteId)`)

## O que precisa de ser decidido

- Quando usar React Hook Form vs validação manual
- Como integrar validação de RBAC (ex: viewer não pode criar OV)
- Como validar regras de negócio no cliente (ex: transporte autorizado para cliente)
- Padrão de erros de formulário (ex: toast, inline) — `🐴` mensagens de erro inline, sem lib de toast
- **Estratégia de idempotência no cliente:** Gerar UUID para cada submissão e enviar como `Idempotency-Key` no header. Desabilitar botão "Criar" após submit para evitar duplicatas visuais. Ver Ticket 2 para implementação server-side.
- **Rollback optimistic UI:** Se a API retornar erro (ex: conflito de agendamento), o estado local deve reverter para o anterior — usando `useReducer` com undo pattern.

## Resolução

*[a preencher quando resolvido]*