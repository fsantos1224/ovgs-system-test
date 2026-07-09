// 🐴 Este ficheiro contém a definição completa do domínio. Num projeto
// maior, as entidades estariam separadas. Num projeto com backend real,
// os tipos seriam gerados a partir do schema da API.

export type OVStatus = 'rascunho' | 'pendente' | 'confirmada' | 'em_transporte' | 'entregue' | 'cancelada';

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
  modal: 'rodoviario' | 'aereo' | 'maritimo' | 'ferroviario';
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
}

export interface EventoAuditoria {
  id: string;
  entidade: string;
  entidadeId: string;
  acao: string;
  usuario: string;
  dataHora: string;
  detalhes: string;
}

export interface UserRole {
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  nome: string;
}

const TRANSITIONS: Record<OVStatus, OVStatus[]> = {
  rascunho: ['pendente', 'cancelada'],
  pendente: ['confirmada', 'cancelada'],
  confirmada: ['em_transporte', 'cancelada'],
  em_transporte: ['entregue', 'cancelada'],
  entregue: [],
  cancelada: [],
};

export function canTransition(from: OVStatus, to: OVStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function statusLabel(status: OVStatus): string {
  const labels: Record<OVStatus, string> = {
    rascunho: 'Rascunho',
    pendente: 'Pendente',
    confirmada: 'Confirmada',
    em_transporte: 'Em Transporte',
    entregue: 'Entregue',
    cancelada: 'Cancelada',
  };
  return labels[status];
}