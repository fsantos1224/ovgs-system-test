# DESIGN SYSTEM & ARQUITETURA — XPTO

Este documento detalha as decisões de design visual, arquitetura de software, modelagem de dados e as especificações de experiência do usuário (UX) adotadas no **XPTO** (_Sistema de Gestão de Ordens de Venda_).

---

## 1. INTRODUÇÃO & CONCEITO

O **XPTO** é um sistema _backoffice_ de gestão de ordens de venda, portfólio de clientes, catálogo de itens/SKUs e agendamento logístico de entregas. O sistema foi construído visando alta confiabilidade operacional, segurança por meio de logs de auditoria detalhados e uma interface imersiva de alto desempenho.

O principal objetivo de negócios do sistema é garantir que cada transição de estado de uma ordem de venda (de _Criada_ a _Entregue_) seja acompanhada de perto, planejada logisticamente em janelas de tempo específicas, e registrada para fins de conformidade e auditoria.

A arquitetura segue o padrão **SPA + Mock API**: o frontend em React consome uma API simulada via `json-server` com middleware custom que implementa as regras de negócio, audit trail e idempotência. Não há backend real — a decisão é intencional para um desafio técnico focado em frontend.

---

## 2. DIRETRIZES ESTÉTICAS & DESIGN SYSTEM

A interface do XPTO segue uma estética **Dark Minimalist / Tech-Editorial** inspirada em painéis de monitoramento industrial de alta densidade e tipografia clássica europeia.

### 2.1 Sistema de Temas

O XPTO oferece dois temas visuais alternativos comutáveis pelo usuário a partir do botão de sol/lua no _sidebar_. A seleção é aplicada via `data-theme="dark" | "light"` no elemento raiz (`<html>`) e os tokens são declarados como **CSS custom properties** no `src/index.css` (Tailwind v4 `@theme`), o que permite trocar a paleta inteira sem _rebuild_ e sem libs de tema em tempo de execução. O tema atual é mantido em memória (Zustand) — recarregar a página restaura o tema escuro padrão.

- **Tema padrão (Dark) — `data-theme="dark"`:** estética principal do sistema; declarada dentro do bloco `@theme` (escopo `:root`).
- **Tema alternativo (Light) — `data-theme="light"`:** declaradono bloco `[data-theme="light"] { ... }`, sobrescrevendo somente os tokens do `@theme` (cascade nativa do CSS).
- **Variante `dark:` do Tailwind:** mapeada para `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`, de modo que utilitários como `dark:bg-amber-950/30` continuam funcionando automaticamente quando o tema dark está ativo.
- **Tokens semânticos (não usar hex/rgb direto nos componentes):** `canvas`, `surface`, `surface-elevated`, `text`, `text-muted`, `text-subtle`, `text-faint`, `accent`, `accent-soft`, `border`, `border-strong`, `border-subtle`, `input-bg`, `hover`, `hover-strong`, `overlay`, `on-accent`, `on-canvas`.

#### 2.1.1 Paleta de Cores — Tema Dark (padrão)

Inspirada em painéis de monitoramento industrial de alta densidade.

- **Fundo Principal (Canvas):** `#0A0A0A` — Preto profundo que minimiza o cansaço visual em longas sessões operacionais.
- **Superfícies de Componentes (Cards/Modais):** `#141414` e `#1c1c1c` — Tons de grafite escuro com bordas sutis.
- **Bordas e Linhas de Grade:** `rgba(255, 255, 255, 0.1)` (`border-white/10`) — Linhas finas que demarcam os espaços sem criar ruído visual.
- **Destaques e Ênfase:** `#3b82f6` (Blue-500) — Cor de marca alinhada à identidade corporativa; indica ações primárias, números importantes ou janelas de agendamento ativas. Badges de status (CRIADA/PLANEJADA/AGENDADA/EM_TRANSPORTE/ENTREGUE) seguem cores semânticas próprias (amber/sky/emerald/purple/zinc) — não são afetados pela troca de accent.
- **Texto Principal:** `#F0F0F0` (Gelo) — Contraste perfeitamente equilibrado que garante alta legibilidade sem ofuscar.
- **Texto Secundário:** `rgba(255, 255, 255, 0.5)` — Legendas, metadados e marcadores secundários.

#### 2.1.2 Paleta de Cores — Tema Light

Versão diurna do mesmo sistema, otimizada para ambientes bem iluminados e impressão. Acento migra de Amber para Sky para preservar hierarquia visual com fundo claro; a paleta evita branco puro para reduzir fadiga em superfícies grandes.

- **Fundo Principal (Canvas):** `#FFFFFF` — Branco neutro, ancorando a hierarquia em superfícies claras.
- **Superfícies de Componentes (Cards/Modais):** `#FFFFFF` e `#F8FAFC` — Branco e cinza-quase-branco que simulam elevação por sombra de borda em vez de preenchimento escuro.
- **Bordas e Linhas de Grade:** `#E2E8F0` (`slate-200`) — Separa blocos com o mesmo rigor do tema dark, mas com peso visível em fundos claros.
- **Destaques e Ênfase:** `#0EA5E9` (Sky-500) — Acento primário e foco de interação (mesma função do Amber no dark). Badges de status (ex: `sky-50/sky-700` para AGENDADA) ganham uma versão clara análoga às suas contrapartes escuras.
- **Texto Principal:** `#1F2937` (`slate-800`) — Contraste AA sobre superfícies brancas.
- **Texto Secundário:** `#64748B` (`slate-500`) — Legendas, metadados e rótulos auxiliares.
- **Overlay modal:** `rgb(15 23 42 / 0.55)` — Camada slate semi-transparente, mais leve que o `rgb(0 0 0 / 0.85)` do dark para não escurecer agressivamente o conteúdo.
- **On-accent:** `#FFFFFF` — Cor de texto sobre o acento Sky (inverte o preto do tema dark).

### 2.2 Tipografia

Para alcançar um ritmo visual refinado e uma distinção clara entre informações analíticas e dados numéricos, o sistema implementa uma estratégia de emparelhamento tipográfico **compartilhada entre os dois temas** (apenas a cor dos glifos muda via token `--color-text`):

- **Títulos Principais (Display):** Estilo serifado e em itálico elegante para dar um tom de "editorial técnico" ou publicação especializada.
- **Interface Geral e Textos de Leitura:** **Inter** (sans-serif) — Limpa, versátil e altamente legível em qualquer escala de tamanho.
- **Códigos, IDs e Valores Monetários:** **JetBrains Mono** / **Fira Code** (monospaced) — Ideal para identificadores únicos (como códigos SKU, números de ordens de venda e timestamps de auditoria), assegurando alinhamento numérico impecável.
- **Famílias registradas como tokens:** `--font-sans`, `--font-serif`, `--font-mono` em `src/index.css` — consumidas via classes utilitárias Tailwind (`font-sans`, `font-serif`, `font-mono`).

### 2.3 Elementos Visuais e Micro-interações

- **Rhythm of Negative Space:** Uso generoso de margens e preenchimentos (_padding_) para guiar os olhos do operador através dos dados mais urgentes.
- **Bordas Arredondadas:** Cantos arredondados de `12px` a `16px` (`rounded-xl` / `rounded-2xl`) suavizam a estrutura industrial rígida dos painéis de dados.
- **Badges de Transição de Status:** Uso de cores discretas e estruturadas por canal sem vibrar em excesso (ex: azul escuro com borda sutil para status _Agendada_, âmbar escuro para status _Planejada_).

---

## 3. MODELAGEM DE DADOS (TYPES)

As entidades do sistema foram rigidamente tipadas no TypeScript (`src/domain/types.ts` + `src/schemas/`) para garantir robustez e consistência. Schemas Zod (`src/schemas/`) validam tanto formulários quanto respostas da API.

### 3.1 Ordem de Venda

Representa o documento principal do fluxo operacional.

```typescript
type OrderStatus = 'CRIADA' | 'PLANEJADA' | 'AGENDADA' | 'EM_TRANSPORTE' | 'ENTREGUE';

interface OrdemVenda {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  tipoTransporteId: string;
  transporte: string;
  status: OrderStatus;
  itens: Array<{
    itemId: string;
    nome: string;
    quantidade: number;
    precoUnitario: number;
  }>;
  valorTotal: number;
  dataCriacao: string;
  dataEntregaPrevista: string | null;
  janelaAtendimento: string | null;
  observacoes: string;
}

// Máquina de estados linear:
// CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE
```

### 3.2 Cliente

Cadastro do portfólio de parceiros com transporte autorizado.

```typescript
interface Cliente {
  id: string;
  nome: string;
  documento: string; // CPF ou CNPJ (11-14 dígitos)
  email: string;
  telefone: string; // 10-11 dígitos
  endereco: string;
  ativo: boolean;
  transportesAutorizados: string[]; // IDs dos tipos de transporte
}
```

### 3.3 Item

Produto ou insumo passível de transação comercial.

```typescript
interface Item {
  id: string;
  nome: string;
  sku: string; // Código técnico identificador, único
  categoria: string;
  precoUnitario: number; // Em centavos
  unidadeMedida: string; // Ex: "un", "m", "kg"
  ativo: boolean;
}
```

### 3.4 Tipo de Transporte

Modalidade logística.

```typescript
interface TipoTransporte {
  id: string;
  nome: string; // Ex: "Caminhão", "Carreta", "Bi-truck"
  modal: 'rodoviario' | 'aereo' | 'maritimo' | 'ferroviario';
  ativo: boolean;
}
```

### 3.5 Evento de Auditoria

Histórico transacional imutável de operações.

```typescript
interface EventoAuditoria {
  id: string;
  entidade: string;
  entidadeId: string;
  acao: string;
  usuario: string;
  dataHora: string;
  estadoAnterior: unknown | null;
  estadoPosterior: unknown | null;
  detalhes: string;
}
```

---

## 4. ARQUITETURA DE SOFTWARE & ESTADO

O XPTO foi projetado como uma **Single-Page Application (SPA)** construída em **React 18** + **Vite**, seguindo uma arquitetura de **camadas horizontais** com TanStack Query, Zustand e json-server como mock API.

```
src/
├── api/fetch.ts         # Fetch nativo com helpers (GET, POST, PATCH, DELETE, paginado)
├── auth/credentials.ts  # Fake data de login (demo)
├── components/          # Componentes reutilizáveis (Modal, Pagination, Toaster)
├── data/usuarios.json   # Contas de demo
├── domain/types.ts      # Interfaces + máquina de estados + helpers puros
├── hooks/               # Hooks de domínio (useConfirm, usePermission)
├── layouts/AppLayout.tsx # Layout principal com sidebar e navegação
├── lib/                 # Utilitários (telemetry, validation, money, id)
├── pages/               # 11 páginas (lazy loaded)
├── queries/             # TanStack Query hooks (useOrdensVenda, useClientes, etc.)
│   └── api.ts           # Cliente API com validação Zod de respostas
├── schemas/             # Schemas Zod (ordemVenda, cliente, transporte, item, auditoria)
├── stores/              # Zustand stores (auth, toast, ui)
├── App.tsx              # Rotas com lazy loading + Suspense
├── main.tsx             # Entry point
└── index.css            # Tailwind v4 @theme + design tokens
```

### 4.1 Gerenciamento de Estado

O sistema usa **3 camadas de estado**, cada uma resolvendo um problema específico:

1. **TanStack Query (queries/)** — dados do servidor (OVs, clientes, transportes, itens, auditoria). Cache com refetch automático, paginação server-side, mutations com invalidação automática.

2. **Zustand (stores/)** — estado global de UI que não vem do servidor:
   - `authStore` — user atual, login/logout (role persistida em `localStorage`)
   - `toastStore` — fila de notificações
   - `uiStore` — tema (dark/light), sidebar colapsada, menu mobile

3. **Estado local (useState/useReducer)** — estado de formulários (React Hook Form), filtros de página, controle de paginação.

### 4.2 Comunicação com o Servidor

A comunicação é feita via API REST mockada pelo `server.cjs`:

- **Fetch nativo** em `src/api/fetch.ts` — wrapper com headers, parsing de erro e helpers de paginação
- **Camada de validação** em `src/queries/api.ts` — Zod schema valida cada resposta da API (tipo-safe em runtime)
- **TanStack Query hooks** em `src/queries/` — cada entidade tem seu hook com `queryKey` tipada

### 4.3 Servidor Mock (server.cjs)

O servidor `server.cjs` é um `json-server` programático com middleware custom:

- **Identity gate** — exige header `x-user` em mutações (401 se ausente)
- **Validação de regras de negócio** — transporte autorizado por cliente, cliente ativo, máquina de estados
- **Idempotência** — chave SHA-256 via header `Idempotency-Key`, store bounded (TTL 1h, max 1000)
- **Allowlist de campos PATCH** — apenas campos permitidos por entidade (F3)
- **Auditoria automática** — todo POST/PATCH/DELETE gera `EventoAuditoria`
- **Paginação** — `_page` + `_limit` + `X-Total-Count` (json-server nativo)

---

## 5. REQUISITOS OPERACIONAIS & MÓDULOS

### 5.1 Dashboard Analítico (`src/pages/Dashboard.tsx`)

- **KPI Cards:** Faturamento total acumulado, total de ordens criadas, entregas concluídas, taxa de agendamento.
- **Distribuição de Status:** Cards por estado (CRIADA, PLANEJADA, AGENDADA, EM_TRANSPORTE, ENTREGUE) com contagem e cor semântica.
- **Ordens Recentes:** Lista das últimas OVs criadas.

### 5.2 Gestão de Ordens de Venda (`src/pages/OVList.tsx`, `OVDetail.tsx`, `OVNew.tsx`)

- **Listagem (`OVList.tsx`):** Tabela paginada com filtros por status, cliente, transporte e data; debounce de 300ms na pesquisa.
- **Criação (`OVNew.tsx`):** React Hook Form com `useFieldArray` para itens dinâmicos; validação Zod; dropdown de transporte dependente do cliente selecionado (transporte autorizado).
- **Detalhe (`OVDetail.tsx`):** Botões de transição de status condicionais (só exibe transições válidas); agendamento inline (data + janela).

### 5.3 Central de Agendamento (`src/pages/Agendamento.tsx`)

- Lista OVs elegíveis para agendamento (status PLANEJADA ou AGENDADA).
- Edição inline de `dataEntregaPrevista` e `janelaAtendimento`.
- Transição automática para AGENDADA ao confirmar data.

### 5.4 Cadastros (`Clientes.tsx`, `Transportes.tsx`, `Itens.tsx`)

- CRUD completo (criar, editar, consultar) com modal de formulário.
- Clientes: campo `transportesAutorizados` (multiselect dos tipos de transporte ativos).
- Validação Zod em todos os formulários.
- RBAC condicional: só exibe botões de editar/excluir se o utilizador tem permissão.

### 5.5 Auditoria & Segurança Transacional (`src/pages/Auditoria.tsx`)

- **Histórico cronológico:** Tabela paginada de eventos imutáveis gerados automaticamente pelo servidor.
- **Eventos registados:** criação de OV, alteração de status, alteração de agendamento, alteração de transporte.
- **Campos por evento:** dataHora, acao, entidade, entidadeId, estadoAnterior, estadoPosterior, detalhes, usuario.
- **Filtros:** pesquisa por utilizador, entidade ou termo nos detalhes.

---

## 6. CONTROLE DE ACESSO (RBAC)

O sistema implementa RBAC com **4 papéis** em hierarquia cumulativa:

```
viewer → operator → manager → admin
```

Cada papel herda as permissões do anterior e adiciona as suas:

| Papel      | Permissões                                          |
| ---------- | --------------------------------------------------- |
| `viewer`   | Listar OVs, clientes, transportes, itens            |
| `operator` | + Criar/editar OVs, alterar status                  |
| `manager`  | + Editar cadastros, agendar entregas, ver auditoria |
| `admin`    | + Gerir utilizadores, todas as permissões           |

**Implementação:**

- Matriz declarativa `PERMISSOES_POR_ROLE` em `src/hooks/usePermission.ts`
- `usePermissao(perm)` — hook que verifica se a role atual ou qualquer role superior tem a permissão
- UI condicional: botões, abas e nav items escondem-se se o utilizador não tem permissão
- Role persistida em `localStorage` (`XPTO:user`, `XPTO:role`)
- Demo: 4 contas em `src/data/usuarios.json`

---

## 7. PERSISTÊNCIA & ARMAZENAMENTO

O sistema usa **3 camadas de armazenamento**:

### 7.1 Dados do Servidor (json-server)

- **`db.seed.json`** — template versionado no git com dados mock (25 OVs, 3 clientes, 3 transportes, 10 itens, eventos de auditoria)
- **`data/db.json`** — ficheiro de runtime gerado pelo json-server no primeiro boot (cópia do seed), ignorado no `.gitignore`
- O `server.cjs` copia o seed para `data/db.json` automaticamente se o ficheiro não existir
- A store de idempotência (`Map` em memória) reseta ao reiniciar o servidor

### 7.2 Estado do Cliente (navegador)

| Dado                 | Local                                     | Persistência                        |
| -------------------- | ----------------------------------------- | ----------------------------------- |
| Sessão do utilizador | Zustand + localStorage (`xpto:auth:user`) | Persistente entre reloads           |
| Tema (dark/light)    | Zustand (memória)                         | Volátil — sempre dark ao recarregar |
| Cache TanStack Query | Memória                                   | Volátil (recria ao recarregar)      |

### 7.3 Estratégia para Produção

Para um ambiente real, a arquitetura atual (TanStack Query + Zustand) permite migrar o `server.cjs` para um backend NestJS + PostgreSQL (ou similar) sem alterar os hooks de query — apenas o `src/queries/api.ts` precisaria de novos endpoints.

---

## 8. COMO EXECUTAR

### Local (tudo num comando)

```bash
npm install
npm run dev:full     # Vite (frontend) + json-server (API) em paralelo
open http://localhost:5173
```

### Local (terminais separados)

```bash
npm install
npm run mock:api    # Terminal 1: json-server em :3001
npm run dev         # Terminal 2: Vite dev em :5173
open http://localhost:5173
```

### Docker

```bash
docker compose up --build
open http://localhost:8080
```

### Credenciais de Demo

| Email               | Senha       | Role     |
| ------------------- | ----------- | -------- |
| admin@XPTO.local    | admin123    | admin    |
| manager@XPTO.local  | manager123  | manager  |
| operator@XPTO.local | operator123 | operator |
| viewer@XPTO.local   | viewer123   | viewer   |
