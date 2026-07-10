# Refatorar OVNew — zodResolver + validação reativa

**Blocked by:** #33 — Infraestrutura de formulários.

**What to build:** Migrar o formulário de criação de OV de validação inline RHF + `safeParse` manual no submit para `zodResolver(ovFormSchema)`, obtendo erros reativos campo a campo.

- [ ] `useForm` configurado com `zodResolver(ovFormSchema)`
- [ ] Registro de campos usa `register()` simples sem `required` inline
- [ ] Erros de campo aparecem reativamente (não apenas no submit)
- [ ] Submit funciona corretamente com dados válidos
- [ ] Build + testes existentes passam
