# Refatorar Login — React Hook Form

**Blocked by:** #33 — Infraestrutura de formulários.

**What to build:** Substituir `useState` controlado por `useForm` com validação simples (email válido, senha obrigatória). Botões de preenchimento rápido devem continuar funcionando via `setValue`.

- [ ] Tela de login usa `useForm` com validação de email + senha
- [ ] Botões de preenchimento rápido (admin/viewer) usam `setValue` para popular campos
- [ ] Submit chama `login()` do authStore corretamente
- [ ] Build + testes existentes passam
