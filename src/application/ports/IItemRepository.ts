import type { Item } from '../../domain/entities/Item';
import type { CriarItemDTO, AtualizarItemDTO } from './DTOs';

export interface IItemRepository {
  listar(): Promise<Item[]>;
  criar(dto: CriarItemDTO): Promise<Item>;
  atualizar(id: string, dto: AtualizarItemDTO): Promise<Item>;
  excluir(id: string): Promise<void>;
}
