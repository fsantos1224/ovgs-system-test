# Refatorar Itens — React Hook Form

**Blocked by:** #33 — Infraestrutura de formulários.

**What to build:** Substituir `FormData` + `e.preventDefault()` por `useForm<ItemInput>` com `zodResolver(itemFormSchema)`, respeitando o transform de `precoUnitario * 100`.

- [ ] Formulário de criar item usa `useForm<ItemInput>` com `zodResolver`
- [ ] Campo de preço lida com input decimal e transform para centavos conforme schema
- [ ] Erros de campo aparecem reativamente
- [ ] Submit dispara mutation corretamente
- [ ] Build + testes existentes passam
