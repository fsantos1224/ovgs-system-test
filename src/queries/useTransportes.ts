import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransporteRepository } from '../infrastructure/repositories/TransporteRepository';
import type { ITransporteRepository } from '../application/ports/ITransporteRepository';
import type { CriarTransporteDTO, AtualizarTransporteDTO } from '../application/ports/DTOs';
import { useToast } from '../stores/toastStore';

const KEY = 'transportes';

const repo: ITransporteRepository = new TransporteRepository();

export function useTransportes() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => repo.listar(),
  });
}

export function useCriarTransporte() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CriarTransporteDTO) => repo.criar(data),
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
    mutationFn: ({ id, data }: { id: string; data: AtualizarTransporteDTO }) => repo.atualizar(id, data),
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
    mutationFn: (id: string) => repo.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Transporte excluído.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao excluir transporte.'),
  });
}
