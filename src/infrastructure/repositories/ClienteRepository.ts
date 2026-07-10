import { z } from 'zod';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../queries/api';
import { clienteSchema } from '../../schemas/cliente';
import type { IClienteRepository } from '../../application/ports/IClienteRepository';
import type { CriarClienteDTO, AtualizarClienteDTO } from '../../application/ports/DTOs';
import type { Cliente } from '../../domain/entities/Cliente';

export class ClienteRepository implements IClienteRepository {
  async listar(): Promise<Cliente[]> {
    return apiGet('/clientes', z.array(clienteSchema));
  }

  async obterPorId(id: string): Promise<Cliente> {
    return apiGet(`/clientes/${id}`, clienteSchema);
  }

  async criar(dto: CriarClienteDTO): Promise<Cliente> {
    return apiPost('/clientes', dto, clienteSchema);
  }

  async atualizar(id: string, dto: AtualizarClienteDTO): Promise<Cliente> {
    return apiPatch(`/clientes/${id}`, dto, clienteSchema);
  }

  async excluir(id: string): Promise<void> {
    return apiDelete(`/clientes/${id}`);
  }
}
