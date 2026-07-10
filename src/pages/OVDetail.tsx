import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Package } from 'lucide-react';
import { useOrdemVenda, useAlterarStatusOV } from '../queries';
import type { OVStatus } from '../domain/types';
import { statusLabel, canTransition, STATUS_FLOW } from '../domain/types';
import { usePermissao } from '../hooks/usePermission';
import { trackEvent } from '../lib/telemetry';
import { useToast } from '../stores/toastStore';
import { Breadcrumbs } from '../components/Breadcrumbs';

const STATUS_BADGE: Record<OVStatus, string> = {
  CRIADA: 'dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 bg-zinc-100 text-zinc-700 border-zinc-300',
  PLANEJADA:
    'dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500/20 bg-amber-50 text-amber-700 border-amber-200',
  AGENDADA: 'dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-500/20 bg-sky-50 text-sky-700 border-sky-200',
  EM_TRANSPORTE:
    'dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500/20 bg-purple-50 text-purple-700 border-purple-200',
  ENTREGUE:
    'dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-500/20 bg-emerald-50 text-emerald-700 border-emerald-200',
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val / 100);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

export function OVDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: ov, isLoading } = useOrdemVenda(id ?? '');
  const podeAlterarStatus = usePermissao('ov:alterar_status');
  const [erroStatus, setErroStatus] = useState('');
  const alterarStatus = useAlterarStatusOV();
  const toast = useToast();

  if (isLoading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );
  if (!ov) return <p className="text-rose-400 p-6">Ordem de venda não encontrada.</p>;

  const transicoesPossiveis = STATUS_FLOW.filter((s) => canTransition(ov.status, s));

  const handleStatusChange = async (novoStatus: string) => {
    const statusAnterior = ov.status;
    try {
      setErroStatus('');
      await alterarStatus.mutateAsync({ id: ov.id, status: novoStatus as OVStatus });
      trackEvent('ov:status:alterar', 'ordem_venda', {
        ovId: ov.id,
        numero: ov.numero,
        de: statusAnterior,
        para: novoStatus,
      });
      toast.success(`Status alterado para ${statusLabel(novoStatus as OVStatus)}`);
    } catch (err) {
      setErroStatus(err instanceof Error ? err.message : 'Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div>
        <Link
          to="/ovs"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-muted hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Voltar
        </Link>
      </div>

      {/* Editorial Header */}
      <div className="border-b border-border pb-4 md:pb-6">
        <Breadcrumbs />
        <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1 font-mono">{ov.numero}</h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Detalhes completos e gestão de status da ordem de venda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Card: Dados da Ordem */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
          <div className="p-4 md:p-6 border-b border-border bg-surface-elevated/40">
            <h2 className="text-[11px] md:text-sm uppercase tracking-widest font-bold text-text">Dados da Ordem</h2>
          </div>
          <div className="p-4 md:p-6 space-y-4 text-xs">
            <div>
              <h4 className="text-[9px] font-bold text-text-faint uppercase tracking-widest">Cliente</h4>
              <p className="text-sm font-bold text-text mt-1">{ov.nomeCliente}</p>
            </div>
            <div>
              <h4 className="text-[9px] font-bold text-text-faint uppercase tracking-widest">Transporte</h4>
              <p className="text-sm font-bold text-text mt-1">{ov.nomeTransporte}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[9px] font-bold text-text-faint uppercase tracking-widest">Emissão</h4>
                <p className="text-xs font-semibold text-text mt-1 font-mono inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-faint" aria-hidden="true" />
                  {formatDate(ov.dataEmissao)}
                </p>
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-text-faint uppercase tracking-widest">Previsão</h4>
                <p className="text-xs font-bold text-accent mt-1 font-mono">{formatDate(ov.dataEntregaPrevista)}</p>
              </div>
            </div>
            <div>
              <h4 className="text-[9px] font-bold text-text-faint uppercase tracking-widest">Status</h4>
              <div className="mt-1.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[ov.status]}`}
                >
                  {statusLabel(ov.status)}
                </span>
              </div>
            </div>
            {ov.observacoes && (
              <div>
                <h4 className="text-[9px] font-bold text-text-faint uppercase tracking-widest">Observações</h4>
                <p className="text-xs text-text-muted mt-1 italic">{ov.observacoes}</p>
              </div>
            )}
            {podeAlterarStatus && transicoesPossiveis.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-[10px] font-bold text-text-faint uppercase tracking-widest mb-2.5">Alterar Status</p>
                <div className="flex flex-wrap gap-2">
                  {transicoesPossiveis.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      aria-label={`Alterar status para ${statusLabel(status)}`}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border-strong rounded-lg hover:bg-accent hover:text-on-accent hover:border-accent font-bold transition-all focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      {statusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {erroStatus && (
              <p role="alert" className="text-rose-400 text-xs pt-2 border-t border-border">
                {erroStatus}
              </p>
            )}
          </div>
        </div>

        {/* Card: Itens */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
          <div className="p-4 md:p-6 border-b border-border bg-surface-elevated/40 flex justify-between items-center">
            <h2 className="text-[11px] md:text-sm uppercase tracking-widest font-bold text-text inline-flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" aria-hidden="true" />
              Itens Registrados
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-text-faint">
              {ov.itens.length} {ov.itens.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                  <th className="px-4 py-4 w-[40%]">Item</th>
                  <th className="px-4 py-4 w-[20%] text-center">Qtd</th>
                  <th className="px-4 py-4 w-[20%] text-right">Valor Unit.</th>
                  <th className="px-4 py-4 w-[20%] text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs">
                {ov.itens.map((item, i) => (
                  <tr key={i} className="hover:bg-hover transition-colors">
                    <td className="px-4 py-4 font-bold text-text truncate">{item.nomeItem}</td>
                    <td className="px-4 py-4 text-center font-mono text-text-muted">{item.quantidade}</td>
                    <td className="px-4 py-4 text-right font-mono text-text-muted truncate">
                      {formatCurrency(item.precoUnitario)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-accent font-mono truncate">
                      {formatCurrency(item.quantidade * item.precoUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border-subtle">
            {ov.itens.map((item, i) => (
              <div key={i} className="p-4 space-y-2 hover:bg-hover transition-colors">
                <p className="font-bold text-text text-sm">{item.nomeItem}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Qtd</span>
                    <p className="font-mono text-text-muted mt-0.5">{item.quantidade}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Valor Unit.</span>
                    <p className="font-mono text-text-muted mt-0.5">{formatCurrency(item.precoUnitario)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Subtotal</span>
                    <p className="font-bold text-accent font-mono mt-0.5">
                      {formatCurrency(item.quantidade * item.precoUnitario)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 md:px-6 py-4 border-t border-border flex justify-between items-center bg-surface-elevated/20">
            <span className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Valor Total</span>
            <span className="text-lg md:text-xl font-bold text-accent font-mono">{formatCurrency(ov.valorTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
