# DESIGN SYSTEM & ARQUITETURA — XPTO

Este documento detalha as decisões de design visual, arquitetura de software, modelagem de dados e as especificações de experiência do usuário (UX) adotadas no **XPTO** (_Sales Order & Logistics Management System_).

---

## 1. INTRODUÇÃO & CONCEITO

O **XPTO** é um sistema moderno de gestão de ordens de venda, portfólio de clientes, catálogo de itens/SKUs e agendamento logístico de entregas. O sistema foi construído visando alta confiabilidade operacional, segurança por meio de logs de auditoria detalhados e uma interface imersiva de alto desempenho.

O principal objetivo de negócios do sistema é garantir que cada transição de estado de uma ordem de venda (de _Criada_ a _Entregue_) seja acompanhada de perto, planejada logisticamente em janelas de tempo específicas, e registrada para fins de conformidade e auditoria.

---

## 2. DIRETRIZES ESTÉTICAS & DESIGN SYSTEM

A interface do XPTO segue uma estética **Dark Minimalist / Tech-Editorial** inspirada em painéis de monitoramento industrial de alta densidade e tipografia clássica europeia.

### 2.1 Paleta de Cores

- **Fundo Principal (Canvas):** `#0A0A0A` — Preto profundo que minimiza o cansaço visual em longas sessões operacionais.
- **Superfícies de Componentes (Cards/Modais):** `#141414` e `#1c1c1c` — Tons de grafite escuro com bordas sutis.
- **Bordas e Linhas de Grade:** `rgba(255, 255, 255, 0.1)` (`border-white/10`) — Linhas finas que demarcam os espaços sem criar ruído visual.
- **Destaques e Ênfase:** `#f59e0b` (Amber/Gold) — Usada de forma intencional para indicar ações primárias, números importantes ou janelas de agendamento ativas.
- **Texto Principal:** `#F0F0F0` (Gelo) — Contraste perfeitamente equilibrado que garante alta legibilidade sem ofuscar.
- **Texto Secundário:** `rgba(255, 255, 255, 0.5)` — Legendas, metadados e marcadores secundários.

### 2.2 Tipografia

Para alcançar um ritmo visual refinado e uma distinção clara entre informações analíticas e dados numéricos, o sistema implementa uma estratégia de emparelhamento tipográfico:

- **Títulos Principais (Display):** Estilo serifado e em itálico elegante para dar um tom de "editorial técnico" ou publicação especializada.
- **Interface Geral e Textos de Leitura:** **Inter** (sans-serif) — Limpa, versátil e altamente legível em qualquer escala de tamanho.
- **Códigos, IDs e Valores Monetários:** **JetBrains Mono** / **Fira Code** (monospaced) — Ideal para identificadores únicos (como códigos SKU, números de ordens de venda e timestamps de auditoria), assegurando alinhamento numérico impecável.

### 2.3 Elementos Visuais e Micro-interações

- **Rhythm of Negative Space:** Uso generoso de margens e preenchimentos (_padding_) para guiar os olhos do operador através dos dados mais urgentes.
- **Bordas Arredondadas:** Cantos arredondados de `12px` a `16px` (`rounded-xl` / `rounded-2xl`) suavizam a estrutura industrial rígida dos painéis de dados.
- **Badges de Transição de Status:** Uso de cores discretas e estruturadas por canal sem vibrar em excesso (ex: azul escuro com borda sutil para status _Agendada_, âmbar escuro para status _Planejada_).

---

## 3. MODELAGEM DE DADOS (TYPES)

As entidades do sistema foram rigidamente tipadas no TypeScript (`src/types.ts`) para garantir robustez e consistência durante o fluxo de mutações de estado:

### 3.1 Ordem de Venda (`SalesOrder`)

Representa o documento principal do fluxo operacional.

```typescript
export type OrderStatus =
  | "Criada"
  | "Planejada"
  | "Agendada"
  | "Em Transporte"
  | "Entregue";

export interface SalesOrder {
  id: string;
  numero: string; // Ex: "OV-2024-0001"
  clienteId: string;
  clienteNome: string;
  transporte: string; // Ex: "Transportadora Rápida"
  status: OrderStatus;
  valorTotal: number;
  previsao: string; // Formato "YYYY-MM-DD"
  janela: string; // Janela logística ("08:00 - 12:00", "13:00 - 17:00", etc.)
  itens: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}
```

### 3.2 Cliente (`Client`)

Cadastro do portfólio de parceiros e destinos comerciais.

```typescript
export interface Client {
  id: string;
  name: string;
  document: string; // CPF ou CNPJ
  email: string;
  telefone: string;
  endereco: string;
  active: boolean; // Habilitado/Desabilitado para novas ordens
}
```

### 3.3 Item de Estoque/Catálogo (`Item`)

Produto ou insumo passível de transação comercial.

```typescript
export interface Item {
  id: string;
  sku: string; // Nome amigável do produto
  name: string; // Código técnico identificador (Ex: "PAR-M10-001")
  category: string;
  unitPrice: number;
  measureUnit: string; // Ex: "un", "m", "kg"
  active: boolean;
}
```

### 3.4 Logs de Auditoria (`AuditLog`)

Histórico transacional imutável de operações efetuadas pelos usuários.

```typescript
export interface AuditLog {
  id: string;
  timestamp: string; // Formato local "DD/MM/YYYY, HH:MM:SS"
  user: string; // E-mail do operador responsável
  entidade: "ordemVenda" | "cliente" | "item" | "geral";
  action: string; // Ex: "alteracao_status", "agendamento"
  detalhes: string; // Ex: "CRIADA ➔ PLANEJADA"
}
```

---

## 4. ARQUITETURA DE SOFTWARE & ESTADO

O XPTO foi projetado como uma **Single-Page Application (SPA)** escalável construída em **React 18** e **Vite**, estruturada em componentes modulares com divisão clara de responsabilidades.

```
/src
  ├── types.ts          # Definições estritas de interfaces
  ├── data.ts           # Carga de dados inicial para testes e demonstração
  ├── index.css         # Importação do Tailwind CSS e definições de Fontes / Temas
  ├── App.tsx           # Ponto de entrada, container de layout e engine de estado global
  └── components/
        ├── Sidebar.tsx        # Navegação persistente e dados da sessão ativa
        ├── LoginView.tsx      # Tela de autenticação e seleção de papéis
        ├── DashboardView.tsx  # Visão analítica, métricas macro e KPIs
        ├── OrdersView.tsx     # Gestão, criação e detalhamento de ordens
        ├── SchedulingView.tsx # Agendamento de janelas e alocação logística
        ├── ClientsView.tsx    # Controle da carteira de clientes ativos
        ├── ItemsView.tsx      # Catálogo de ativos comercializáveis
        └── AuditView.tsx      # Histórico cronológico detalhado de transações
```

### 4.1 Gerenciamento de Estado Reativo

Para evitar re-renderizações desnecessárias e manter a sincronia em tempo real, a aplicação adota uma estratégia de **Estado Centralizado** em `App.tsx`:

1. **Coleções de Estado:** `orders`, `clients`, `items` e `auditLogs` residem no componente raiz `App.tsx`.
2. **Atualização Baseada em Callbacks:** As visualizações filhas recebem funções puras de manipulação (ex: `handleScheduleOrder`, `handleUpdateOrderStatus`) para despachar atualizações de volta ao container principal.
3. **Auditoria Automatizada:** Qualquer alteração no estado de uma entidade (como ativação de cliente ou agendamento de janela) chama automaticamente o método `appendAuditLog`, acoplando o autor da ação, o carimbo de data/hora preciso e a descrição exata da mutação.

---

## 5. REQUISITOS OPERACIONAIS & MÓDULOS

### 5.1 Dashboard Analítico

- **KPI Cards:** Exibe o faturamento total acumulado, o total de ordens criadas, o total de entregas concluídas e a taxa de eficiência de agendamento.
- **Gráficos de Funil:** Integra componentes visuais interativos que mostram a distribuição percentual das ordens de venda através de seus respectivos estados.
- **Ordens Críticas:** Destaca ordens pendentes de agendamento ou com previsão próxima.

### 5.2 Gerenciador de Ordens de Venda

- **Criação Dinâmica:** Operadores criam novas ordens de venda selecionando clientes habilitados e adicionando itens múltiplos diretamente do catálogo ativo com recálculo automático do valor total em tempo real.
- **Visualizador de Detalhes:** Painel lateral ou gaveta que detalha cada item, quantidade, transporte e histórico específico da ordem selecionada.

### 5.3 Central de Agendamento Logístico

- **Gargalo de Decisão:** Filtra apenas ordens que necessitam de janela logística.
- **Slots de Entrega:** O operador seleciona a data e aloca a ordem em um turno operacional específico (_Manhã_, _Tarde_, _Noite_). Ao confirmar, a ordem é migrada automaticamente para o estado **Agendada**.

### 5.4 Auditoria & Segurança Transacional

- **Aparência Imutável:** Histórico cronológico de atividades.
- **Filtros Avançados:** Permite pesquisar por operador, buscar por palavras-chave específicas ou filtrar por módulo afetado.
- **Representação Visual de Transições:** Modificações de status de ordens de venda são renderizadas como caminhos de badges direcionais (ex: `CRIADA ➔ PLANEJADA`), facilitando a compreensão rápida de alterações.

---

## 6. CONTROLE DE ACESSO (RBAC)

O sistema possui suporte básico para controle de acesso baseado em papéis (_Role-Based Access Control_), dividindo as permissões em dois perfis de operadores:

- **Operador Administrador (`admin`):** Permissão completa para criar ordens, editar cadastros de clientes, adicionar novos produtos ao catálogo, reagendar janelas logísticas e inspecionar os registros de auditoria.
- **Operador Visualizador (`viewer`):** Permissão de leitura em todo o sistema, sem capacidade de modificar registros, garantindo proteção contra alterações não autorizadas.

---

## 7. PERSISTÊNCIA & ARMAZENAMENTO

Para o ambiente atual em preview, os dados utilizam estados reativos em memória com sementes carregadas do arquivo `src/data.ts`. A arquitetura de callbacks implementada em `App.tsx` foi desenhada especificamente para facilitar uma migração transparente para o **Firebase Firestore** ou um banco de dados relacional como o **PostgreSQL (via Cloud SQL com Drizzle)** sem a necessidade de reescrever as views de interface.
