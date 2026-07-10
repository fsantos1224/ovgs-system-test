# Refatorar Agendamento — React Hook Form

**Blocked by:** #33 — Infraestrutura de formulários.

**What to build:** Substituir `FormData` + `e.preventDefault()` por `useForm` com `zodResolver(agendamentoFormSchema)`, obtendo validação reativa do formato de janela.

- [ ] Formulário de agendamento usa `useForm` com `zodResolver(agendamentoFormSchema)`
- [ ] Validação de janela (`HH:MM-HH:MM`, fim > início) é reativa
- [ ] Submit dispara mutation de atualização de OV corretamente
- [ ] Build + testes existentes passam
