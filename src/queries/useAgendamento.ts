import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrdemVendaRepository } from '../infrastructure/repositories/OrdemVendaRepository';
import { AgendarEntregaUseCase } from '../application/use-cases/AgendarEntregaUseCase';
import type { IOrdemVendaRepository } from '../application/ports/IOrdemVendaRepository';
import { useToast } from '../stores/toastStore';

const KEY = 'ordensVenda';

const repo: IOrdemVendaRepository = new OrdemVendaRepository();
const agendarEntrega = new AgendarEntregaUseCase(repo);

interface AgendarInput {
  id: string;
  dataEntrega: string;
  janela: string;
}

export function useAgendarEntrega() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: AgendarInput) => agendarEntrega.executar(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success('Agendamento salvo com sucesso.');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao salvar agendamento'),
  });
}
