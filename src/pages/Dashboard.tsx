import { useNavigate } from "react-router-dom";
import { useOrdensVenda } from "../queries";
import type { OrdemVendaResponse } from "../schemas/ordemVenda";
import type { OVStatus } from "../domain/types";
import { statusLabel } from "../domain/types";
import { ArrowRight } from "lucide-react";

const STATUS_BADGE: Record<OVStatus, string> = {
  CRIADA:
    "dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 bg-zinc-100 text-zinc-700 border-zinc-300",
  PLANEJADA:
    "dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500/20 bg-amber-50 text-amber-700 border-amber-200",
  AGENDADA:
    "dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-500/20 bg-sky-50 text-sky-700 border-sky-200",
  EM_TRANSPORTE:
    "dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500/20 bg-purple-50 text-purple-700 border-purple-200",
  ENTREGUE:
    "dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-500/20 bg-emerald-50 text-emerald-700 border-emerald-200",
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

const STATUS_ORDER: OVStatus[] = [
  "AGENDADA",
  "CRIADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val / 100);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

export function Dashboard() {
  const navigate = useNavigate();
  const { data: ordensData, isLoading } = useOrdensVenda({ page: 1, pageSize: 100 });
  const ordens = ordensData?.data as OrdemVendaResponse[] | undefined;

  if (isLoading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted">
        Carregando...
      </p>
    );

  const porStatus =
    ordens?.reduce<Record<string, number>>((acc, ov) => {
      const label = statusLabel(ov.status);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {}) ?? {};

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="border-b border-border pb-4 md:pb-6">
        <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">
          Dashboard / MÓDULO PRINCIPAL
        </span>
        <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">
          Dashboard
        </h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Visão analítica das suas operações, ordens e fluxo logístico.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {STATUS_ORDER.map((status) => {
          const count = porStatus[statusLabel(status)] ?? 0;
          return (
            <div
              key={status}
              className="bg-surface rounded-xl border border-border p-4 md:p-6 relative overflow-hidden flex flex-col justify-between h-28 md:h-32 transition-all duration-200 hover:border-border-strong"
            >
              <div>
                <span
                  className={`text-2xl md:text-4xl font-serif italic ${STATUS_ACCENT[status]}`}
                >
                  {count}
                </span>
                <p className="text-[10px] uppercase tracking-widest text-text-faint font-bold mt-2 md:mt-2.5">
                  {statusLabel(status)}
                </p>
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 h-[3px] ${STATUS_BAR[status]}`}
              />
            </div>
          );
        })}
      </div>

      {/* Latest Orders */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center bg-surface-elevated/40">
          <h2 className="text-[11px] md:text-sm uppercase tracking-widest font-bold text-text">
            Últimas Ordens de Venda
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-text-faint">
            {ordens?.length ?? 0} registros
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-5 py-4 w-[18%]">Número</th>
                <th className="px-5 py-4 w-[30%]">Cliente</th>
                <th className="px-5 py-4 w-[20%]">Status</th>
                <th className="px-5 py-4 w-[16%] text-right">Valor</th>
                <th className="px-5 py-4 w-[16%] text-right">Previsão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {ordens?.slice(0, 5).map((ov) => (
                <tr
                  key={ov.id}
                  onClick={() => navigate(`/ovs/${ov.id}`)}
                  className="hover:bg-hover transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-5 py-4 font-bold text-text font-mono truncate">
                    {ov.numero}
                  </td>
                  <td className="px-5 py-4 text-text-muted font-medium truncate">
                    {ov.nomeCliente}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${STATUS_BADGE[ov.status]}`}
                    >
                      {statusLabel(ov.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-accent font-mono tabular-nums truncate">
                    {formatCurrency(ov.valorTotal)}
                  </td>
                  <td className="px-5 py-4 text-right text-text-subtle font-mono tabular-nums truncate">
                    {formatDate(ov.dataEmissao)}
                  </td>
                </tr>
              ))}
              {ordens?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-text-subtle italic"
                  >
                    Nenhuma ordem de venda registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border-subtle">
          {ordens?.slice(0, 5).map((ov) => (
            <div
              key={ov.id}
              onClick={() => navigate(`/ovs/${ov.id}`)}
              className="p-4 space-y-3 hover:bg-hover transition-colors cursor-pointer active:bg-hover-strong"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-bold text-text font-mono">
                    {ov.numero}
                  </span>
                  <p className="text-xs text-text-muted font-medium mt-0.5">
                    {ov.nomeCliente}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${STATUS_BADGE[ov.status]}`}
                >
                  {statusLabel(ov.status)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-text-faint">
                    Valor
                  </span>
                  <p className="font-bold text-accent font-mono mt-0.5">
                    {formatCurrency(ov.valorTotal)}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-text-faint">
                    Previsão
                  </span>
                  <p className="text-text-subtle font-mono mt-0.5">
                    {formatDate(ov.dataEmissao)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {ordens?.length === 0 && (
            <div className="px-6 py-12 text-center text-text-subtle italic">
              Nenhuma ordem de venda registrada.
            </div>
          )}
        </div>

        <div className="border-t border-border bg-surface-elevated/20 px-4 md:px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-text-faint font-bold">
            Mostrando {Math.min(5, ordens?.length ?? 0)} de {ordens?.length ?? 0}
          </span>
          <button
            type="button"
            onClick={() => navigate("/ovs")}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-on-accent hover:bg-accent px-3 py-1.5 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          >
            Ver todas as ordens
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
