import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import { itemSchema } from '../schemas/item';
import type { ItemResponse } from '../schemas/item';
import type { CriarItemDTO, AtualizarItemDTO } from '../application/ports/DTOs';
import { useToast } from '../stores/toastStore';

const KEY = 'itens';

export function useItens() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiGet<ItemResponse[]>('/itens', z.array(itemSchema)),
  });
}

export function useCriarItem() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CriarItemDTO) => apiPost('/itens', data, itemSchema),
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
    mutationFn: ({ id, data }: { id: string; data: AtualizarItemDTO }) => apiPatch(`/itens/${id}`, data, itemSchema),
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
    mutationFn: (id: string) => apiDelete(`/itens/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Item excluído.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao excluir item.'),
  });
}
