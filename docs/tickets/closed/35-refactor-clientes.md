# Refatorar Clientes — React Hook Form

**Blocked by:** #33 — Infraestrutura de formulários.

**What to build:** Substituir `FormData` + `e.preventDefault()` por `useForm<ClienteInput>` com `zodResolver(clienteFormSchema)`, mantendo formatação de documento/telefone via `onChange` controlado.

- [ ] Formulário de criar/editar cliente usa `useForm<ClienteInput>` com `zodResolver`
- [ ] Formatação de documento e telefone funciona via `onChange` do RHF
- [ ] Erros de campo aparecem reativamente
- [ ] Submit dispara mutation corretamente
- [ ] Build + testes existentes passam
