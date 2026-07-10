import { z } from 'zod';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../queries/api';
import { itemSchema } from '../../schemas/item';
import type { IItemRepository } from '../../application/ports/IItemRepository';
import type { CriarItemDTO, AtualizarItemDTO } from '../../application/ports/DTOs';
import type { Item } from '../../domain/entities/Item';

export class ItemRepository implements IItemRepository {
  async listar(): Promise<Item[]> {
    return apiGet('/itens', z.array(itemSchema));
  }

  async criar(dto: CriarItemDTO): Promise<Item> {
    return apiPost('/itens', dto, itemSchema);
  }

  async atualizar(id: string, dto: AtualizarItemDTO): Promise<Item> {
    return apiPatch(`/itens/${id}`, dto, itemSchema);
  }

  async excluir(id: string): Promise<void> {
    return apiDelete(`/itens/${id}`);
  }
}
