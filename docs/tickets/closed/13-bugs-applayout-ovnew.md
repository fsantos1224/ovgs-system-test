# Ticket 13 — Corrigir bugs em AppLayout + OVNew

- **Tipo:** `wayfinder:bugfix`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

A code review do projeto identificou três bugs concretos que afetam diretamente usuários:

1. **Rules of Hooks violation em `AppLayout.tsx:50`** — `usePermissao(item.perm)` é chamado dentro de callback `.map()`. React vai avisar em runtime ("Rendered fewer hooks than during the previous render") e pode renderizar permissões stale quando a lista de nav items muda.
2. **Mensagens de erro nunca aparecem em `OVNew.tsx`** — `register("clienteId", { required: true })` não define `.message`, então `fieldErrors.clienteId.message` é `undefined` e o usuário não vê feedback ao submeter vazio. Afeta `clienteId`, `transporteId` e `itens`.
3. **Race entre `fields` e `data` em `OVNew.tsx:56`** — `validate(data, fields.filter(...).length)` mistura estado RHF (`fields`) com dados submetidos (`data`). `fields` reflete o que está _registrado_, não o que foi _digitado_. Se o usuário limpa um `itemId` após digitar, `fields[i].itemId` ainda guarda o default antigo.

## Restrições YAGNI

- Sem refactor amplo — fix pontual em cada arquivo
- Sem nova lib — só reordenação de hooks existentes + strings de mensagem

## Cenários de aceitação

- [ ] AppLayout não emite warning de Rules of Hooks ao alternar role
- [ ] Submeter OVNew vazio mostra `<p role="alert">` com texto para `clienteId`, `transporteId` e cada item sem `itemId`
- [ ] Validar com cliente+transporte+item e submeter com sucesso continua funcionando
- [ ] Limpar `itemId` de um item depois de digitar faz o `validate()` detectar o problema e bloquear submit
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final (7 E2E, não 3)

## Notas

- O fix 1 provavelmente pede mover `usePermissao` para o escopo do componente via um pequeno helper `useNavPermissions()` que retorna um array alinhado ao `navItems`.
- O fix 2 é mecânico: adicionar `{ required: "Selecione um cliente" }` etc.
- O fix 3 troca `fields` por `data.itens` na chamada de `validate`.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código:**

1. **AppLayout (Rules of Hooks):** `src/layouts/AppLayout.tsx:50-55` — os 6 `usePermissao()` foram movidos para o topo do componente (escopo do `AppLayout`), e o array `navItems` é construído usando o booleano já calculado. Nenhum hook é chamado dentro de `.map()` / callback.
2. **OVNew — mensagens de erro:** `src/pages/OVNew.tsx:160` (`required: "Selecione um cliente"`), `:178` (`"Selecione um transporte"`), `:202` (`"Informe a data de entrega"`), `:253-254` (`min: 1, message: "Mínimo 1"` em quantidade). Cada erro é renderizado inline em `<p role="alert">` com classe `text-rose-400`.
3. **OVNew — race entre `fields` e `data`:** `src/pages/OVNew.tsx:79` — a checagem `itensValidos = data.itens.filter((i) => i.itemId).length` usa `data` (submetido) e não `fields` (registrado). Reflete exatamente o que foi digitado, não o default state.

**Verificação:** `npm test` → 16/16 passando. `[1m` o `id="hook-rules"` foi corrigido sem refactor amplo e sem libs novas — alinhado com YAGNI.
