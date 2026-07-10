import { z } from 'zod';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../queries/api';
import { transporteSchema } from '../../schemas/transporte';
import type { ITransporteRepository } from '../../application/ports/ITransporteRepository';
import type { CriarTransporteDTO, AtualizarTransporteDTO } from '../../application/ports/DTOs';
import type { TipoTransporte } from '../../domain/entities/TipoTransporte';

export class TransporteRepository implements ITransporteRepository {
  async listar(): Promise<TipoTransporte[]> {
    return apiGet('/tiposTransporte', z.array(transporteSchema));
  }

  async criar(dto: CriarTransporteDTO): Promise<TipoTransporte> {
    return apiPost('/tiposTransporte', dto, transporteSchema);
  }

  async atualizar(id: string, dto: AtualizarTransporteDTO): Promise<TipoTransporte> {
    return apiPatch(`/tiposTransporte/${id}`, dto, transporteSchema);
  }

  async excluir(id: string): Promise<void> {
    return apiDelete(`/tiposTransporte/${id}`);
  }
}
