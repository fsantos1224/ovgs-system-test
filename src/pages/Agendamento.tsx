import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agendamentoFormSchema } from '../schemas';
import type { AgendamentoInput } from '../lib/validation';
import { FormField } from '../components/FormField';
import { Calendar, Clock } from 'lucide-react';
import { useOrdensVenda, useAtualizarOV } from '../queries';
import { usePermissao } from '../hooks/usePermission';
import { statusLabel } from '../domain/types';
import { trackEvent } from '../lib/telemetry';
import { useToast } from '../stores/toastStore';
import { Breadcrumbs } from '../components/Breadcrumbs';

const STATUS_BADGE: Record<string, string> = {
  CRIADA: 'dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 bg-zinc-100 text-zinc-700 border-zinc-300',
  PLANEJADA:
    'dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500/20 bg-amber-50 text-amber-700 border-amber-200',
  AGENDADA: 'dark:bg-blue-950/30 dark:text-blue-300 dark:border-amber-500/20 bg-sky-50 text-sky-700 border-sky-200',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

export function Agendamento() {
  const { data: ordensData, isLoading } = useOrdensVenda({ page: 1, pageSize: 100 });
  const ordens = ordensData?.data;
  const podeAgendar = usePermissao('agendamento:criar');
  const podeVer = usePermissao('agendamento:ver');
  const [editando, setEditando] = useState<string | null>(null);
  const atualizarOV = useAtualizarOV();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgendamentoInput>({
    resolver: zodResolver(agendamentoFormSchema),
    defaultValues: { dataEntrega: '', janela: '' },
  });

  if (isLoading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );
  if (!podeVer) return <p className="text-text-muted p-6">Sem permissão para acessar esta página.</p>;

  const agendaveis = ordens?.filter((o) => o.status === 'PLANEJADA' || o.status === 'AGENDADA') ?? [];

  const onSubmitForm = async (data: AgendamentoInput) => {
    const ov = agendaveis.find((o) => o.id === editando);
    if (!ov) return;
    const body: Record<string, string> = {};
    if (data.dataEntrega) body.dataEntregaPrevista = new Date(data.dataEntrega).toISOString();
    if (data.janela) body.janelaAtendimento = data.janela;
    if (ov.status === 'PLANEJADA') body.status = 'AGENDADA';
    try {
      await atualizarOV.mutateAsync({ id: ov.id, data: body });
      trackEvent('ov:agendar', 'ordem_venda', {
        ovId: ov.id,
        dataEntregaPrevista: data.dataEntrega,
        janelaAtendimento: data.janela,
      });
      setEditando(null);
      toast.success('Agendamento salvo com sucesso.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar agendamento');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-border pb-6">
        <Breadcrumbs />
        <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">Central de Agendamento</h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Agende e organize janelas de entrega para ordens planejadas.
        </p>
      </div>

      {agendaveis.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-subtle italic">
          Nenhuma ordem necessitando de agendamento no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agendaveis.map((ov) => {
            const editandoAgora = editando === ov.id;
            const isScheduled = ov.status === 'AGENDADA';
            return (
              <div
                key={ov.id}
                className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between hover:border-border-strong transition-all duration-200 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-bold text-text font-mono">{ov.numero}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[ov.status]}`}
                    >
                      {statusLabel(ov.status)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text mt-3.5 truncate">{ov.nomeCliente}</h3>
                </div>

                <div className="space-y-2.5 border-t border-b border-border-subtle py-4 my-3 text-xs">
                  <div className="flex items-center gap-2.5 text-text-muted font-mono">
                    <Calendar className="w-4 h-4 text-text-faint" aria-hidden="true" />
                    <span>
                      Data prevista:{' '}
                      <strong className="text-text font-bold">{formatDate(ov.dataEntregaPrevista)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-muted font-mono">
                    <Clock className="w-4 h-4 text-text-faint" aria-hidden="true" />
                    <span>
                      Janela:{' '}
                      <strong className={ov.janelaAtendimento ? 'text-accent font-bold' : 'text-text-faint'}>
                        {ov.janelaAtendimento || '—'}
                      </strong>
                    </span>
                  </div>
                </div>

                {editandoAgora ? (
                  <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-3">
                    <FormField label="Data" required error={errors.dataEntrega}>
                      <input
                        type="date"
                        {...register('dataEntrega')}
                        className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
                      />
                    </FormField>
                    <FormField label="Janela" error={errors.janela}>
                      <input
                        type="text"
                        placeholder="ex: 08:00-12:00"
                        {...register('janela')}
                        className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden placeholder:text-text-faint"
                      />
                    </FormField>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(null);
                          reset();
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-widest font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-surface-elevated hover:bg-accent hover:text-on-accent border border-border-strong text-text text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        {isScheduled ? 'Reagendar' : 'Confirmar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  podeAgendar && (
                    <button
                      onClick={() => {
                        setEditando(ov.id);
                        reset({
                          dataEntrega: ov.dataEntregaPrevista?.split('T')[0] ?? '',
                          janela: ov.janelaAtendimento ?? '',
                        });
                      }}
                      className={`w-full text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-accent ${
                        isScheduled
                          ? 'border border-border-strong hover:bg-accent hover:text-on-accent hover:border-accent text-text'
                          : 'bg-surface-elevated hover:bg-accent hover:text-on-accent text-text border border-border-strong'
                      }`}
                    >
                      {isScheduled ? 'Reagendar' : 'Agendar'}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
