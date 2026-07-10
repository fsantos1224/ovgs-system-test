import type { TipoTransporte } from '../../domain/entities/TipoTransporte';
import type { CriarTransporteDTO, AtualizarTransporteDTO } from './DTOs';

export interface ITransporteRepository {
  listar(): Promise<TipoTransporte[]>;
  criar(dto: CriarTransporteDTO): Promise<TipoTransporte>;
  atualizar(id: string, dto: AtualizarTransporteDTO): Promise<TipoTransporte>;
  excluir(id: string): Promise<void>;
}
