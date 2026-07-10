import type { OrdemVenda, OVStatus } from '../../domain/entities/OrdemVenda';
import type { ListarOVParams, PaginatedResult } from './DTOs';

export type CriarOVPayload = Omit<OrdemVenda, 'id'>;

export interface IOrdemVendaRepository {
  listar(params: ListarOVParams): Promise<PaginatedResult<OrdemVenda>>;
  obterPorId(id: string): Promise<OrdemVenda>;
  criar(dto: CriarOVPayload, extraHeaders?: Record<string, string>): Promise<OrdemVenda>;
  atualizar(id: string, dto: Partial<Omit<OrdemVenda, 'id'>>): Promise<OrdemVenda>;
  alterarStatus(id: string, status: OVStatus): Promise<OrdemVenda>;
  excluir(id: string): Promise<void>;
}
