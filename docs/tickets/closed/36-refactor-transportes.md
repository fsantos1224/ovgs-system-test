# Refatorar Transportes — React Hook Form

**Blocked by:** #33 — Infraestrutura de formulários.

**What to build:** Substituir `FormData` + `e.preventDefault()` por `useForm<TransporteInput>` com `zodResolver(transporteFormSchema)`.

- [ ] Formulário de criar/editar transporte usa `useForm<TransporteInput>` com `zodResolver`
- [ ] Erros de campo aparecem reativamente
- [ ] Submit dispara mutation corretamente
- [ ] Build + testes existentes passam
