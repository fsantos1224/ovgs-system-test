import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ItemRepository } from '../infrastructure/repositories/ItemRepository';
import type { IItemRepository } from '../application/ports/IItemRepository';
import type { CriarItemDTO, AtualizarItemDTO } from '../application/ports/DTOs';
import { useToast } from '../stores/toastStore';

const KEY = 'itens';

const repo: IItemRepository = new ItemRepository();

export function useItens() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => repo.listar(),
  });
}

export function useCriarItem() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CriarItemDTO) => repo.criar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Item criado.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao criar item.'),
  });
}

export function useAtualizarItem() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AtualizarItemDTO }) => repo.atualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Item atualizado.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao atualizar item.'),
  });
}

export function useExcluirItem() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => repo.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Item excluído.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao excluir item.'),
  });
}
