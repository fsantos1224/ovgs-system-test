import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import { transporteSchema } from '../schemas/transporte';
import type { TransporteResponse } from '../schemas/transporte';
import type { CriarTransporteDTO, AtualizarTransporteDTO } from '../application/ports/DTOs';
import { useToast } from '../stores/toastStore';

const KEY = 'transportes';

export function useTransportes() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiGet<TransporteResponse[]>('/tiposTransporte', z.array(transporteSchema)),
  });
}

export function useCriarTransporte() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CriarTransporteDTO) => apiPost('/tiposTransporte', data, transporteSchema),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Transporte criado.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao criar transporte.'),
  });
}

export function useAtualizarTransporte() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AtualizarTransporteDTO }) =>
      apiPatch(`/tiposTransporte/${id}`, data, transporteSchema),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Transporte atualizado.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao atualizar transporte.'),
  });
}

export function useExcluirTransporte() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/tiposTransporte/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Transporte excluído.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao excluir transporte.'),
  });
}
