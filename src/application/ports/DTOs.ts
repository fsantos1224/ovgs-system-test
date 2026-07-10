export interface CriarOVDTO {
  clienteId: string;
  transporteId: string;
  dataEntregaPrevista: string;
  observacoes?: string;
  itens: { itemId: string; quantidade: number }[];
}

export interface AtualizarOVDTO {
  dataEntregaPrevista?: string;
  janelaAtendimento?: string;
  observacoes?: string;
  status?: string;
}

export interface ListarOVParams {
  page: number;
  pageSize: number;
  filters?: Record<string, string | undefined>;
  sort?: string;
  order?: string;
}

export interface CriarClienteDTO {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco?: string;
  ativo: boolean;
  transportesAutorizados?: string[];
}

export interface AtualizarClienteDTO {
  nome?: string;
  documento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  ativo?: boolean;
  transportesAutorizados?: string[];
}

export interface CriarItemDTO {
  nome: string;
  sku: string;
  categoria: string;
  precoUnitario: number;
  unidadeMedida: string;
  ativo: boolean;
}

export interface AtualizarItemDTO {
  nome?: string;
  sku?: string;
  categoria?: string;
  precoUnitario?: number;
  unidadeMedida?: string;
  ativo?: boolean;
}

export interface CriarTransporteDTO {
  nome: string;
  modal: 'rodoviario' | 'aereo' | 'maritimo' | 'ferroviario';
  ativo: boolean;
}

export interface AtualizarTransporteDTO {
  nome?: string;
  modal?: 'rodoviario' | 'aereo' | 'maritimo' | 'ferroviario';
  ativo?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
}
