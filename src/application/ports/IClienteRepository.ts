import type { Cliente } from '../../domain/entities/Cliente';
import type { CriarClienteDTO, AtualizarClienteDTO } from './DTOs';

export interface IClienteRepository {
  listar(): Promise<Cliente[]>;
  obterPorId(id: string): Promise<Cliente>;
  criar(dto: CriarClienteDTO): Promise<Cliente>;
  atualizar(id: string, dto: AtualizarClienteDTO): Promise<Cliente>;
  excluir(id: string): Promise<void>;
}
