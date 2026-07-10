import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { OrdemVendaRepository } from '../infrastructure/repositories/OrdemVendaRepository';
import { CriarOrdemVendaUseCase } from '../application/use-cases/CriarOrdemVendaUseCase';
import { AlterarStatusOVUseCase } from '../application/use-cases/AlterarStatusOVUseCase';
import type { IOrdemVendaRepository, CriarOVPayload } from '../application/ports/IOrdemVendaRepository';
import type { ListarOVParams } from '../application/ports/DTOs';
import type { OVStatus } from '../domain/entities/OrdemVenda';
import { useToast } from '../stores/toastStore';

const KEY = 'ordensVenda';

const repo: IOrdemVendaRepository = new OrdemVendaRepository();
const criarOV = new CriarOrdemVendaUseCase(repo);
const alterarStatusOV = new AlterarStatusOVUseCase(repo);

export { type CriarOVPayload };

export function useOrdensVenda(params: ListarOVParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => repo.listar(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrdemVenda(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => repo.obterPorId(id),
    enabled: !!id,
  });
}

export function useCriarOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ data, headers }: { data: CriarOVPayload; headers?: Record<string, string> }) =>
      criarOV.executar(data, headers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('OV criada.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao criar OV.'),
  });
}

export function useAtualizarOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      repo.atualizar(id, data as Parameters<typeof repo.atualizar>[1]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('OV atualizada.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao atualizar OV.'),
  });
}

export function useExcluirOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => repo.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('OV excluída.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao excluir OV.'),
  });
}

export function useAlterarStatusOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OVStatus }) => alterarStatusOV.executar(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('OV status alterado.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao alterar status da OV.'),
  });
}
