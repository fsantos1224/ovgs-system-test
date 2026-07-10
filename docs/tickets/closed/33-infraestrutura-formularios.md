# Infraestrutura de formulários — resolver, FormField, schema

**Blocked by:** None — can start immediately.

**What to build:** Instalar `@hookform/resolvers`, criar componente `FormField` reutilizável para padronizar label+erro em formulários, e criar schema Zod para agendamento (atualmente sem schema).

- [ ] `@hookform/resolvers` adicionado ao package.json
- [ ] Componente `FormField` criado em `src/components/` — renderiza label, children e mensagem de erro do `formState.errors` do RHF
- [ ] Schema `agendamentoFormSchema` criado em `src/schemas/agendamento.ts` com validação de janela (`HH:MM-HH:MM`, fim > início)
- [ ] Build (`npm run build`) passa limpo
