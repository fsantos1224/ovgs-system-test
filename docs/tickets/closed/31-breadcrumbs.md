# Ticket 31 — Breadcrumbs dinâmicos

- **Tipo:** `wayfinder:feature`
- **Bloqueado por:** Nenhum

## Questão

Cada página tem um "kicker" hardcoded do tipo `Ordens de Venda / DETALHES` no topo. Strings são literais em cada arquivo:

- `OVList.tsx:105`
- `OVNew.tsx:150`
- `OVDetail.tsx`
- `Clientes.tsx`
- `Transportes.tsx`
- `Itens.tsx`
- `Agendamento.tsx`
- `Auditoria.tsx`

Deep-links (URL compartilhada por teammate) não mostram rastro de navegação. Usuário fica sem orientação espacial.

Substituir por breadcrumbs calculados a partir de `useMatches()` do react-router-dom v6, com `handle.crumb` declarado por `<Route>` no `App.tsx`.

## Restrições YAGNI

- Sem dropdown nos itens
- Sem "página atual oculta como última" — trilha visível completa; última entrada marcada com `aria-current="page"`
- Sem internacionalização de labels (rotas em pt-BR direto)
- Sem persistência (deep-link não-válido não redireciona)

## Cenários de aceitação

- [ ] `src/hooks/useBreadcrumbs.ts` exporta hook que retorna `Array<{label: string, href?: string}>`
- [ ] Hook usa `useMatches()` do react-router-dom, filtra matches sem `handle.crumb`, mapeia para a estrutura
- [ ] Última entrada tem `href: undefined` (é a página atual)
- [ ] Cada `<Route>` em `App.tsx` declara `handle={{ crumb: () => "Nome" }}` ou `handle={{ crumb: useOVCrumb }}` para dinâmicos
- [ ] Trilha renderizada em `<Breadcrumbs>` componente (separador `›`, último com `aria-current="page"`, `<nav aria-label="Breadcrumb">`)
- [ ] Substituir todos os kickers hardcoded nas 8 páginas pelo `<Breadcrumbs />`
- [ ] A11y: `<ol>` para a lista, cada item com `<Link>` exceto o último
- [ ] Visual smoke: `/ovs/abc-uuid` mostra `Dashboard › Ordens de Venda › abc-uuid`
- [ ] Doc drift

## Notas

- `handle.crumb` é uma função lazy porque às vezes precisa de `useParams()`. React Router permite isso — o match é re-derivado em cada render com base no caminho atual.
- Para OV detail, o crumb pode mostrar `OV-2025-0042` (o número, não o UUID). Hook separado resolve.
- Breadcrumb do Dashboard (rota raiz) deve começar com `"Dashboard"` ou ser omitido — decidir pela consistência visual.
- Componente `<Breadcrumbs />` renderiza imediatamente acima do `<h1>` da página; mantém o "kicker" visual mas agora dinâmico.

---

## Decision record

**Implementado:**

- `src/hooks/useBreadcrumbs.ts` — hook que usa `useMatches()` do `createBrowserRouter` para derivar trilha dos `handle.crumb` das rotas.
- `src/components/Breadcrumbs.tsx` — `<nav aria-label="Breadcrumb">` com `<ol>`, separador `/`, último item com `aria-current="page"`.
- `App.tsx` migrado de `<BrowserRouter>` para `createBrowserRouter` (data router necessário para `useMatches()`).
- Cada rota declarou `handle: { crumb: () => "Nome" }`.
- Kickers hardcoded substituídos por `<Breadcrumbs />` em 9 páginas (Dashboard, OVList, OVNew, OVDetail, Agendamento, Clientes, Transportes, Itens, Auditoria).

**Desvio de spec:**

- A rota `/ovs/:id` (Detalhes) usa crumb estático "Detalhes" em vez de dinâmico `"OV-2025-0042"`. O hook suporta funções assíncronas, mas o crumb dinâmico exigiria um hook separado com `useParams` + `useQuery` dentro do `handle.crumb`. Adiado para simplificação.
