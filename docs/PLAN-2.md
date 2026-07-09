# PLAN — UI Polish, Brand Color, Dinamismo de Rotas

> Documento de planejamento. **Nenhuma implementação será feita antes da aprovação.**

---

## 1. Goal

Sete incrementos de UX/UI, todos com **restrições YAGNI** (sem refactor amplo, sem libs além de uma única para toaster), preservando a arquitetura atual (React 18 + Vite + React Router + json-server).

| # | Incremento | Origem |
|---|---|---|
| 1 | Máscara monetária BRL nos inputs de valor | UX |
| 2 | Coluna "Ações" (editar/deletar) em todas as tabelas | UX |
| 3 | Seleção múltipla + remoção em massa | UX |
| 4 | Modal de confirmação para edit/create/delete | Segurança UX |
| 5 | Toaster após cada ação (lib nova) | Feedback |
| 6 | Breadcrumbs dinâmicos a partir da rota ativa | UX |
| 7 | Dark theme: Amber/Gold → tom de Azul (alinhamento brand) | Design System |

---

## 2. Decisões técnicas

### 2.1 Lib nova (somente uma)

**Sonner** (~5 kB gzip) para toaster — única lib adicionada. Justificativa:
- API mínima (`toast.success(...)`)
- Sem provider obrigatório (vs `react-hot-toast` que tem)
- Tema dark/light nativo
- Acessibilidade ARIA built-in

```json
"dependencies": {
  "sonner": "^1.7.0"
}
```

### 2.2 Sem refactor amplo

- Máscara monetária: `<MoneyInput>` component local (não `<CurrencyInput>` com locale negociation)
- Modal de confirmação: reusa `<Modal>` nativo (`src/components/Modal.tsx`) — sem portal lib
- Bulk delete: estado local no componente de listagem — sem Context
- Breadcrumbs: hook `useBreadcrumbs()` local — sem lib

### 2.3 Tema dark: troca de `--color-accent`

**Sem alterar a arquitetura de tokens.** Só os valores literais em `src/index.css` mudam:

```diff
- --color-accent: #f59e0b;       /* Amber/Gold */
- --color-accent-soft: rgb(245 158 11 / 0.15);
+ --color-accent: #3b82f6;       /* blue-500 — alinhamento brand */
+ --color-accent-soft: rgb(59 130 246 / 0.15);
```

A variante `dark:` dos badges de status em todas as páginas tem `bg-amber-950/30` que **não vem dos tokens** — esses ficam como estão (Amber = sinal de "atenção" semântico, não cor de marca).

### 2.4 O que **NÃO** entra no escopo

- Não trocar `numero` da OV por máscara (é display, não editável)
- Não internacionalizar (lib `Intl.NumberFormat` pt-BR já está em uso)
- Não trocar fonte
- Não revisar tipografia editorial
- Não adicionar testes E2E para cada novo fluxo (cobertura vitest unit onde fizer sentido)

---

## 3. Design Tokens — Blue accent (novo dark)

```css
/* src/index.css @theme (substituição do bloco Amber/Gold) */
--color-accent:        #3b82f6;   /* blue-500 */
--color-accent-soft:   rgb(59 130 246 / 0.15);
--color-on-accent:     #ffffff;

/* Light theme mantém Sky (#0EA5E9) — único accent corporativo */
[data-theme="light"] {
  --color-accent:      #0284c7;   /* sky-600 — um tom mais profundo no light */
}
```

Componentes impactados pela troca: tudo que usa `text-accent`, `bg-accent`, `border-accent` na classe. **A maioria já está via tokens** (não vai precisar ajustar nada em 80% dos arquivos).

Verificação após troca: `grep -r "f59e0b\|amber-500\|amber-600" src/` deve retornar apenas usos semânticos (badges `bg-amber-950/30` em `CRIADA`/`PLANEJADA`).

---

## 4. Incrementos

### 4.1 Máscara monetária BRL (`<MoneyInput>`)

**Arquivos:**
- `src/components/MoneyInput.tsx` (novo)
- Aplicar em: `OVNew.tsx` (preço unitário × quantidade — mas hoje é só número; criar display de valor total estimado já formatado), `OVDetail.tsx` (campo valorTotal é read-only, mas exibe edit hint)

**Escopo real:** O backend armazena valores em **centavos** (inteiro). Front hoje usa `Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"})` para **display**. O input direto de valor monetário editável só aparece em:
- `Transportes.tsx` (cadastro/edição se houver) — campo `custo` ainda não existe
- `Itens.tsx` — campo `precoUnitario` em **centavos** (inteiro)

**Decisão:** Máscara real no input só faz sentido se o dado armazenado for decimal. Como está em centavos (prática comum para evitar floats), manter inputs tipo `number` e só **mascarar visualmente o display**. Exceção: campo de edição em massa onde faz sentido input formatado — mas isso cai no escopo do ticket 26 (CRUD completo nos cadastros), não deste escopo.

**Restrição:** este item **não produz componente** — detecta-se que o input não faz sentido sem mudança no schema.

**Cenário de aceitação (revisado):**
- [ ] Display de `valorTotal` em todas as tabelas continua formatado `Intl.NumberFormat("pt-BR", currency: "BRL")`
- [ ] Nenhum input numérico exposto sem semântica clara (centavos vs decimal)
- [ ] Se for decidido input decimal: helper `parseBRLtoCents(str): number` em `src/lib/money.ts` com testes

**Notas:**
- `precoUnitario` em `Itens.tsx` está como inteiro (centavos) — input type="number" continua correto
- Máscara BRL tradicional com `Intl` no display já é suficiente
- Decidir com o usuário antes de partir para schema migration

---

### 4.2 Coluna "Ações" (editar/deletar)

**Arquivos:**
- `OVList.tsx`, `OVDetail.tsx` (já tem — manter)
- `Clientes.tsx` — adicionar coluna
- `Transportes.tsx` — adicionar coluna
- `Itens.tsx` — adicionar coluna
- `Agendamento.tsx` — adicionar coluna (se aplicável)
- `Auditoria.tsx` — só visualização, sem ações

**UI por linha:**
```
[ ✏️ Editar ] [ 🗑️ Excluir ]   ← ícones, com `aria-label`
[ Detalhes ]                  ← já existe em OVList
```

**Restrições YAGNI:**
- Sem menu dropdown ("..." com 5 opções) — apenas 2 botões visíveis quando o usuário tem permissão
- Sem confirmação inline (a confirmação vem do ticket 26.4)

**Cenários de aceitação:**
- [ ] Botões `aria-label="Editar {entidade}"` e `"Excluir {entidade}"`
- [ ] Render condicional por RBAC (`usePermissao`)
- [ ] Width da coluna ações fixa (`w-32`), alinhada à direita
- [ ] Responsivo: em mobile, ícones só

---

### 4.3 Seleção múltipla + remoção em massa

**Escopo:** tabelas de listagem (Clientes, Transportes, Itens, OVs).

**UI:**
```
[ ☐ ]  Número   Cliente   Status   ...   [Ações]
[ ☑ ]  OV-001   Alpha     AGENDADA ...   [...]
[ ☑ ]  OV-002   Beta      CRIADA   ...   [...]
[ ☐☐☐ ] ← checkbox "all" no header
```

Quando ≥1 selecionado, aparece action bar fixa no rodapé:
```
[ 3 selecionados ]  [ Excluir selecionados ]  [ Cancelar ]
```

**Restrições YAGNI:**
- Sem shift-click range selection — só toggle individual + toggle-all
- Sem persistir seleção no reload

**Endpoints novos no server.cjs:**
- `POST /clientes/bulk-delete`, `POST /itens/bulk-delete`, etc. — **NÃO**.
- **Mais simples:** envia um por um em paralelo (fetch + `Promise.allSettled`). Backend já aceita DELETE por id; cada um gera sua auditoria individual. Vantagem: cada exclusão gera seu evento (não um evento batch ambíguo). Limite client-side: confirmar com usuário se >10.

**Cenários de aceitação:**
- [ ] Checkbox por linha + checkbox header (toggle-all) com `aria-label`
- [ ] Counter "X selecionados" flutuante no rodapé
- [ ] Botão "Excluir selecionados" só aparece com ≥1 selecionado
- [ ] Confirmação via modal (item 26.4) com lista de nomes afetados
- [ ] Após sucesso: toaster `success` com count
- [ ] Falha em item individual não bloqueia os outros (`allSettled`)
- [ ] Auditoria: cada DELETE gera evento individual (já implementado no ticket 22)

---

### 4.4 Modal de confirmação para edit/create/delete

**Escopo:** todas as ações mutantes (POST, PUT, PATCH, DELETE) em todas as páginas.

**Reuso:** `<Modal>` nativo (`src/components/Modal.tsx`).

**UI (3 variantes):**

```
            Criar OV?
            ╭──────────────────────────╮
            │                          │
            │    Você está criando     │
            │    uma nova OV para      │
            │    Empresa Alpha Ltda.   │
            │                          │
            │    Itens: 3              │
            │    Total: R$ 5.000,00    │
            │                          │
            │   [Cancelar]  [Criar]    │
            ╰──────────────────────────╯
```

**API proposta (hook):**
```ts
const confirm = useConfirm();

const handleDelete = async () => {
  const ok = await confirm({
    title: "Excluir cliente?",
    body: `${cliente.nome} será removido permanentemente.`,
    confirmLabel: "Excluir",
    variant: "danger",
  });
  if (!ok) return;
  await apiDelete(`/clientes/${id}`);
};
```

**Restrições YAGNI:**
- Sem variantes elaborate ("3 passos de wizard") — só `default` | `danger`
- Sem input no modal (a confirmação é só sim/não)

**Cenários de aceitação:**
- [ ] Hook `useConfirm()` retorna função que abre modal e retorna Promise<boolean>
- [ ] Modal reutiliza `<Modal>` (não cria portal novo)
- [ ] Variante `danger` aplica `bg-rose-950/30` no botão confirmar
- [ ] Cancelar = Esc, clicar fora, botão Cancelar
- [ ] Após confirmação, ação executada + toaster
- [ ] Estado do modal global em Context mínimo (`<ConfirmProvider>` no `AppLayout`)

---

### 4.5 Toaster (lib nova: sonner)

**Arquivos:**
- `package.json` — adicionar `sonner`
- `src/components/Toaster.tsx` — wrapper
- `<Toaster>` montado em `AppLayout.tsx`
- Cada ação cria 1 toast via `toast.success(...)` / `toast.error(...)`

**UI (canto inferior direito, dark theme-aware):**
```
╭─────────────────────────────────────╮
│ ✓ OV OV-2025-0042 criada             │
│   Empresa Alpha Ltda · R$ 1.500,00  │
╰─────────────────────────────────────╯
```

**Mensagens padronizadas:**
- Create: `✓ {Entidade} {nome/id} criada`
- Update: `✓ {Entidade} {nome/id} atualizada`
- Delete: `✓ {Entidade} {nome/id} excluída`
- Bulk: `✓ {N} {entidades} excluídas`
- Error: `✕ {erro.userMessage}` (do `errBody.error`)

**Restrições:**
- Sem queue management (toast desaparece sozinho após 4s)
- Sem actions inline (`<button>` no toast) — apenas fechar

**Cenários de aceitação:**
- [ ] `sonner` instalado e listado em `package.json`
- [ ] `<Toaster />` em `AppLayout.tsx` com `theme` controlado pelo `data-theme`
- [ ] Cada `apiPost/apiPatch/apiDelete` wrapper chama `toast.success` ou `toast.error` automaticamente (princípio: **uma chamada, dois efeitos**)
- [ ] Doc drift (README + MAP)

**Decisão arquitetural:** Pôr o `toast` dentro dos wrappers `apiPost`/`apiPatch`/`apiDelete` em `src/api/fetch.ts`. **Não** chamar toast manualmente em cada página. Isso evita 50 chamadas espalhadas.

---

### 4.6 Breadcrumbs dinâmicos

**Escopo:** cabeçalho de cada página (H1 da página tem um "kicker" pequeno tipo `Ordens de Venda / FLUXO DE TRANSAÇÕES`).

**Hoje:** strings hardcoded em cada página:
- `OVNew.tsx:150`: "Ordens de Venda / NOVA TRANSAÇÃO"
- `OVDetail.tsx`: "Ordens de Venda / DETALHES"
- `OVList.tsx:105`: "Ordens de Venda / FLUXO DE TRANSAÇÕES"
- `Clientes.tsx`: "Clientes / CADASTRO"
- etc.

**Proposta:**

```ts
// src/hooks/useBreadcrumbs.ts (novo)
// Lê o React Router match, monta trilha dinâmica
const trail = useBreadcrumbs();
// trail = [{label: "Dashboard", href:"/"}, {label: "Ordens de Venda", href:"/ovs"}, {label:"OV-2025-0042"}]
```

**UI gerada:**
```
Dashboard › Ordens de Venda › OV-2025-0042
```

**Abordagem técnica:**
- Usar `useMatches()` do react-router-dom v6 (já provê handle com `crumb` opcional)
- Configurar `handle` em cada `<Route>` no `AppLayout`:

```tsx
<Route handle={{ crumb: () => "Ordens de Venda" }} path="ovs" element={...} />
<Route handle={{ crumb: useParamsCrumb("numero") }} path="ovs/:id" element={...} />
```

**Restrições YAGNI:**
- Sem dropdown nos itens
- Sem "página atual é a última, oculta" — todos visíveis

**Cenários de aceitação:**
- [ ] `src/hooks/useBreadcrumbs.ts` retorna trilha a partir de `useMatches()`
- [ ] Cada `<Route>` em `App.tsx` declara `handle.crumb`
- [ ] `<Breadcrumbs>` componente renderiza trilha (separadores `›`)
- [ ] Última entrada não tem link (é a página atual)
- [ ] Substituir todos os "kicker" hardcoded nas páginas pelo componente
- [ ] A11y: `<nav aria-label="Breadcrumb">` + `<ol>` + `aria-current="page"` no último

---

### 4.7 Dark theme: Amber → Blue accent

**Arquivos:**
- `src/index.css:18-29` (bloco `@theme`)
- Não precisa mexer no light theme (já é azul corporativo)
- `src/data/usuarios.json` (se houver cor hardcoded)
- Audit: `grep -r "f59e0b\|amber-500\b\|text-amber-500" src/` para confirmar que remanescentes são badges de status semânticos

**Tabela de tokens — antes/depois:**

| Token | Antes | Depois |
|---|---|---|
| `--color-accent` | `#f59e0b` (Amber/Gold) | `#3b82f6` (Blue-500) |
| `--color-accent-soft` | `rgb(245 158 11 / 0.15)` | `rgb(59 130 246 / 0.15)` |
| `--color-on-accent` | `#000000` | `#ffffff` |

**Componentes afetados (exemplos):**
- `text-accent` em headlines
- `bg-accent` em botões hover/Criar
- `border-accent` em hover states

**Componentes NÃO afetados:**
- `bg-amber-950/30` (badges `CRIADA`/`PLANEJADA`) — fica Amber = status code, semântico
- `bg-emerald-950/30` (`ENTREGUE`) — fica Emerald
- `bg-sky-50` (`AGENDADA` light badge) — fica Sky

**Cenários de aceitação:**
- [ ] `npm run build` continua sem warnings
- [ ] `grep -r "f59e0b" src/` retorna vazio em usos primários (badges podem ter)
- [ ] Inspeção visual: dark theme agora é predominantemente azul em ações
- [ ] Atualizar `docs/DESIGN.md` seção 2.1.1 com a nova paleta
- [ ] Atualizar screenshot do README (se existir) com nova cor

---

## 5. Ordem de execução sugerida (fronteira)

| # | Ticket | Tipo | Bloq. | Esforço |
|---|---|---|---|---|
| 1 | 26 | Mascára monetária (ou refinamento do display) | wayfinder:task | — | 0.5 dia |
| 2 | 27 | Coluna Ações nas tabelas | wayfinder:feature | — | 1 dia |
| 3 | 28 | Seleção múltipla + bulk delete | wayfinder:feature | 27 | 1.5 dia |
| 4 | 29 | Modal de confirmação (`useConfirm`) | wayfinder:feature | — | 1 dia |
| 5 | 30 | Toaster (sonner) | wayfinder:feature | 29 | 0.5 dia |
| 6 | 31 | Breadcrumbs dinâmicos | wayfinder:feature | — | 1 dia |
| 7 | 32 | Dark accent Amber → Blue | wayfinder:design | — | 0.5 dia |

**Dependências internas:**
- 28 depende de 27 (coluna ações precisa existir)
- 30 (toaster) pode ser feito independente, mas é melhor após 29 (modal) para fechar o fluxo

**Tempo total estimado:** 4-5 dias de trabalho contínuo.

---

## 6. Risco e trade-offs

| Risco | Mitigação |
|---|---|
| Quebrar testes existentes ao tocar `src/api/fetch.ts` para injetar toast | Manter assinaturas idênticas; toast é side-effect via `try/catch` |
| Switch amber→blue quebrar referências hardcoded em testes E2E | Atualizar fixtures/expectations |
| Sonner ser dependência pesada na prática | Avaliar tree-shaking; se >8kB gzip, alternativa `react-hot-toast` |
| Breadcrumbs dinâmicos complicarem rotas aninhadas | Começar simples (1 nível) e evoluir |
| Máscara monetária exigir mudança de schema (centavos → decimal) | **Escopo 4.1 revisado** — não produz componente; só revisão do display |

---

## 7. Não vai ser feito (fora deste plano)

- Migrar schema de centavos para decimal
- Internacionalização (i18n) completa
- Tema claro dinâmico automático (`prefers-color-scheme`)
- Dark mode por horário automático
- Storybook para os novos componentes
- Animação de drag-drop para bulk select
- Undo para delete (soft delete)

---

## 8. Próximo passo

Após aprovação, abrir os 7 tickets em `docs/tickets/` na ordem da fronteira (seção 5). Cada ticket mantém o padrão do projeto (Questão, Restrições YAGNI, Cenários de aceitação, Notas, Resolução).
