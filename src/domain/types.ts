// Domínio alinhado com a especificação do desafio. 5 status lineares, sem lib de state machine.

export type OVStatus = (typeof STATUS_FLOW)[number];

export const STATUS_FLOW = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
] as const;

export function canTransition(from: OVStatus, to: OVStatus): boolean {
  const i = STATUS_FLOW.indexOf(from);
  return i >= 0 && STATUS_FLOW[i + 1] === to;
}

export function statusLabel(status: OVStatus): string {
  const labels: Record<OVStatus, string> = {
    CRIADA: "Criada",
    PLANEJADA: "Planejada",
    AGENDADA: "Agendada",
    EM_TRANSPORTE: "Em Transporte",
    ENTREGUE: "Entregue",
  };
  return labels[status];
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
}

export interface TipoTransporte {
  id: string;
  nome: string;
  modal: "rodoviario" | "aereo" | "maritimo" | "ferroviario";
  ativo: boolean;
}

export interface Item {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  precoUnitario: number;
  unidadeMedida: string;
  ativo: boolean;
}

export interface ItemOV {
  itemId: string;
  nomeItem: string;
  quantidade: number;
  precoUnitario: number;
}

export interface OrdemVenda {
  id: string;
  numero: string;
  clienteId: string;
  nomeCliente: string;
  dataEmissao: string;
  dataEntregaPrevista: string;
  transporteId: string;
  nomeTransporte: string;
  status: OVStatus;
  itens: ItemOV[];
  valorTotal: number;
  observacoes?: string;
  janelaAtendimento?: string;
}

export interface EventoAuditoria {
  id: string;
  entidade: string;
  entidadeId: string;
  acao: string;
  usuario: string;
  dataHora: string;
  detalhes: string;
  estadoAnterior?: string;
  estadoPosterior?: string;
}

export interface UserRole {
  role: "admin" | "manager" | "operator" | "viewer";
  nome: string;
}
