import { useFetch } from '../hooks/useFetch';
import type { OrdemVenda, OVStatus } from '../domain/types';
import { statusLabel } from '../domain/types';

const STATUS_BADGE: Record<OVStatus, string> = {
  CRIADA: "bg-zinc-900 text-zinc-400 border border-zinc-800",
  PLANEJADA: "bg-amber-950/30 text-amber-300 border border-amber-500/20",
  AGENDADA: "bg-blue-950/30 text-blue-300 border border-blue-500/20",
  EM_TRANSPORTE: "bg-purple-950/30 text-purple-300 border border-purple-500/20",
  ENTREGUE: "bg-emerald-950/30 text-emerald-300 border border-emerald-500/20",
};

const STATUS_ACCENT: Record<string, string> = {
  CRIADA: "text-amber-500",
  PLANEJADA: "text-amber-500",
  AGENDADA: "text-blue-500",
  EM_TRANSPORTE: "text-purple-500",
  ENTREGUE: "text-emerald-500",
};

const STATUS_BAR: Record<string, string> = {
  CRIADA: "bg-amber-500",
  PLANEJADA: "bg-amber-500",
  AGENDADA: "bg-blue-500",
  EM_TRANSPORTE: "bg-purple-500",
  ENTREGUE: "bg-emerald-500",
};

const STATUS_ORDER: OVStatus[] = ["AGENDADA", "CRIADA", "EM_TRANSPORTE", "ENTREGUE"];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

export function Dashboard() {
  const { data: ordens, loading } = useFetch<OrdemVenda[]>('/ordensVenda');

  if (loading) return <p role="status" aria-live="polite" className="text-text-muted">Carregando...</p>;

  const porStatus = ordens?.reduce<Record<string, number>>((acc, ov) => {
    const label = statusLabel(ov.status);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6">
        <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">
          VOL. 01 / MÓDULO PRINCIPAL
        </span>
        <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">Dashboard</h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Visão analítica das suas operações, ordens e fluxo logístico.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATUS_ORDER.map((status) => {
          const count = porStatus[statusLabel(status)] ?? 0;
          return (
            <div
              key={status}
              className="bg-surface rounded-xl border border-border p-6 relative overflow-hidden flex flex-col justify-between h-32 transition-all duration-200 hover:border-border-strong"
            >
              <div>
                <span className={`text-4xl font-serif italic ${STATUS_ACCENT[status]}`}>{count}</span>
                <p className="text-[10px] uppercase tracking-widest text-text-faint font-bold mt-2.5">
                  {statusLabel(status)}
                </p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${STATUS_BAR[status]}`} />
            </div>
          );
        })}
      </div>

      {/* Latest Orders Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-elevated/40">
          <h2 className="text-sm uppercase tracking-widest font-bold text-text">Últimas Ordens de Venda</h2>
          <span className="text-[10px] uppercase tracking-widest text-text-faint">
            {ordens?.length ?? 0} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-6 py-4.5">Número</th>
                <th className="px-6 py-4.5">Cliente</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5 text-right">Valor</th>
                <th className="px-6 py-4.5">Previsão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {ordens?.slice(0, 5).map((ov) => (
                <tr key={ov.id} className="hover:bg-hover transition-colors duration-150 cursor-pointer">
                  <td className="px-6 py-4.5 font-bold text-text font-mono">{ov.numero}</td>
                  <td className="px-6 py-4.5 text-text-muted font-medium">{ov.nomeCliente}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[ov.status]}`}>
                      {statusLabel(ov.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right font-bold text-accent font-mono">
                    {formatCurrency(ov.valorTotal)}
                  </td>
                  <td className="px-6 py-4.5 text-text-subtle font-mono">{formatDate(ov.dataEmissao)}</td>
                </tr>
              ))}
              {ordens?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-subtle italic">
                    Nenhuma ordem de venda registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}