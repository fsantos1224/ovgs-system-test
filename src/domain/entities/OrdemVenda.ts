export const STATUS_FLOW = ['CRIADA', 'PLANEJADA', 'AGENDADA', 'EM_TRANSPORTE', 'ENTREGUE'] as const;

export type OVStatus = (typeof STATUS_FLOW)[number];

export interface ItemOV {
  id: string;
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
  observacoes: string | null | undefined;
  janelaAtendimento: string | null | undefined;
}

export function canTransition(from: OVStatus, to: OVStatus): boolean {
  const i = STATUS_FLOW.indexOf(from);
  return i >= 0 && STATUS_FLOW[i + 1] === to;
}

export function statusLabel(status: OVStatus): string {
  const labels: Record<OVStatus, string> = {
    CRIADA: 'Criada',
    PLANEJADA: 'Planejada',
    AGENDADA: 'Agendada',
    EM_TRANSPORTE: 'Em Transporte',
    ENTREGUE: 'Entregue',
  };
  return labels[status];
}
