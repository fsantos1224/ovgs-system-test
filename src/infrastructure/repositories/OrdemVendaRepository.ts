import { z } from 'zod';
import { apiGet, apiGetPaginated, apiPost, apiPatch, apiDelete } from '../../queries/api';
import { ordemVendaSchema } from '../../schemas/ordemVenda';
import type { IOrdemVendaRepository, CriarOVPayload } from '../../application/ports/IOrdemVendaRepository';
import type { ListarOVParams, PaginatedResult } from '../../application/ports/DTOs';
import type { OrdemVenda, OVStatus } from '../../domain/entities/OrdemVenda';

export class OrdemVendaRepository implements IOrdemVendaRepository {
  async listar(params: ListarOVParams): Promise<PaginatedResult<OrdemVenda>> {
    const searchParams = new URLSearchParams({
      _page: String(params.page),
      _limit: String(params.pageSize),
    });
    for (const [k, v] of Object.entries(params.filters ?? {})) {
      if (v) searchParams.set(k, v);
    }
    if (params.sort) searchParams.set('_sort', params.sort);
    if (params.order) searchParams.set('_order', params.order);
    return apiGetPaginated(`/ordensVenda?${searchParams}`, z.array(ordemVendaSchema));
  }

  async obterPorId(id: string): Promise<OrdemVenda> {
    return apiGet(`/ordensVenda/${id}`, ordemVendaSchema);
  }

  async criar(dto: CriarOVPayload, extraHeaders?: Record<string, string>): Promise<OrdemVenda> {
    return apiPost('/ordensVenda', dto, ordemVendaSchema, extraHeaders);
  }

  async atualizar(id: string, dto: Partial<Omit<OrdemVenda, 'id'>>): Promise<OrdemVenda> {
    return apiPatch(`/ordensVenda/${id}`, dto, ordemVendaSchema);
  }

  async alterarStatus(id: string, status: OVStatus): Promise<OrdemVenda> {
    return apiPatch(`/ordensVenda/${id}`, { status }, ordemVendaSchema);
  }

  async excluir(id: string): Promise<void> {
    return apiDelete(`/ordensVenda/${id}`);
  }
}
