import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClienteRepository } from '../infrastructure/repositories/ClienteRepository';
import type { IClienteRepository } from '../application/ports/IClienteRepository';
import type { CriarClienteDTO, AtualizarClienteDTO } from '../application/ports/DTOs';
import { useToast } from '../stores/toastStore';

const KEY = 'clientes';

const repo: IClienteRepository = new ClienteRepository();

export function useClientes() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => repo.listar(),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => repo.obterPorId(id),
    enabled: !!id,
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CriarClienteDTO) => repo.criar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Cliente criado com sucesso.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao criar cliente'),
  });
}

export function useAtualizarCliente() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AtualizarClienteDTO }) => repo.atualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Cliente atualizado com sucesso.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao atualizar cliente'),
  });
}

export function useExcluirCliente() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => repo.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Cliente excluído.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao excluir cliente'),
  });
}
