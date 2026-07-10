import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Eye } from "lucide-react";
import { useOrdensVenda, useClientes, useTransportes } from "../queries";
import type { OVStatus } from "../domain/types";
import { statusLabel, STATUS_FLOW } from "../domain/types";
import { usePermissao } from "../hooks/usePermission";
import { Pagination } from "../components/Pagination";

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

export function OVList() {
  const podeCriar = usePermissao("ov:criar");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroTransporte, setFiltroTransporte] = useState("");
  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");

  const [page, setPage] = useState(1);

  const { data: clientesData } = useClientes();
  const { data: transportesData } = useTransportes();
  const clientes = clientesData ?? [];
  const transportes = transportesData ?? [];

  const filters = { q: debouncedSearch || undefined, status: filtroStatus || undefined, nomeCliente_like: filtroCliente || undefined, nomeTransporte_like: filtroTransporte || undefined, dataEntregaPrevista_gte: dataDe || undefined, dataEntregaPrevista_lte: dataAte || undefined };

  const { data: ordensData, isLoading } = useOrdensVenda({ page, pageSize: 10, filters });
  const ordens = ordensData?.data;
  const totalCount = ordensData?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const toInputDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const aplicarAtalho = (dias: number) => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - (dias - 1));
    setDataDe(toInputDate(inicio));
    setDataAte(toInputDate(hoje));
  };

  if (isLoading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">
            Ordens de Venda / FLUXO DE TRANSAÇÕES
          </span>
          <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">
            Ordens de Venda
          </h1>
          <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
            Crie, gerencie e acompanhe o status de todas as ordens de venda.
          </p>
        </div>
        {podeCriar && (
          <Link
            to="/ovs/nova"
            className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Nova Ordem de Venda</span>
          </Link>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-surface rounded-xl border border-border p-4 md:p-5 space-y-4">
        {/* Linha 1 — filtros estruturais */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="">Todos</option>
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">
              Cliente
            </label>
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="">Todos</option>
              {clientes?.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">
              Transporte
            </label>
            <select
              value={filtroTransporte}
              onChange={(e) => setFiltroTransporte(e.target.value)}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="">Todos</option>
              {transportes?.map((t) => (
                <option key={t.id} value={t.nome}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden placeholder:text-text-faint"
            />
          </div>
        </div>

        {/* Linha 2 — período (atalhos + inputs de data) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 border-t border-border-subtle">
          <div className="space-y-1.5 lg:col-span-8">
            <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider block">
              Atalhos de período
            </span>
            <div
              className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1"
              role="group"
              aria-label="Atalhos de período"
            >
              <button
                type="button"
                onClick={() => aplicarAtalho(7)}
                className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-md border border-border-strong text-text-muted hover:bg-accent hover:text-on-accent hover:border-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                Últimos 7 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalho(30)}
                className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-md border border-border-strong text-text-muted hover:bg-accent hover:text-on-accent hover:border-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent"
              >
                Últimos 30 dias
              </button>
              <button
                type="button"
                onClick={() => {
                  setDataDe("");
                  setDataAte("");
                }}
                disabled={!dataDe && !dataAte}
                className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-md border border-border text-text-faint hover:text-text hover:border-border-strong transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-faint"
              >
                Limpar
              </button>
            </div>
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <label
              htmlFor="filtro-data-de"
              className="text-[10px] font-bold text-text-faint uppercase tracking-wider block"
            >
              De
            </label>
            <input
              id="filtro-data-de"
              type="date"
              lang="pt-BR"
              value={dataDe}
              max={dataAte || undefined}
              onChange={(e) => setDataDe(e.target.value)}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
            />
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <label
              htmlFor="filtro-data-ate"
              className="text-[10px] font-bold text-text-faint uppercase tracking-wider block"
            >
              Até
            </label>
            <input
              id="filtro-data-ate"
              type="date"
              lang="pt-BR"
              value={dataAte}
              min={dataDe || undefined}
              onChange={(e) => setDataAte(e.target.value)}
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-4 py-4 w-[14%]">Número</th>
                <th className="px-4 py-4 w-[18%]">Cliente</th>
                <th className="px-4 py-4 w-[20%]">Transporte</th>
                <th className="px-4 py-4 w-[14%]">Status</th>
                <th className="px-4 py-4 w-[14%] text-right">Valor Total</th>
                <th className="px-4 py-4 w-[12%]">Previsão</th>
                <th className="px-4 py-4 w-[8%] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {ordens?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-text-subtle italic"
                  >
                    Nenhuma ordem encontrada.
                  </td>
                </tr>
              ) : (
                ordens?.map((ov) => (
                  <tr
                    key={ov.id}
                    className="hover:bg-hover transition-colors duration-150"
                  >
                    <td className="px-4 py-4 font-bold text-text font-mono truncate">
                      {ov.numero}
                    </td>
                    <td className="px-4 py-4 text-text-muted font-medium truncate">
                      {ov.nomeCliente}
                    </td>
                    <td className="px-4 py-4 text-text-subtle truncate">
                      {ov.nomeTransporte}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[ov.status]}`}
                      >
                        {statusLabel(ov.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-accent font-mono truncate">
                      {formatCurrency(ov.valorTotal)}
                    </td>
                    <td className="px-4 py-4 text-text-subtle font-mono truncate">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar
                          className="w-3.5 h-3.5 text-text-faint shrink-0"
                          aria-hidden="true"
                        />
                        {formatDate(ov.dataEntregaPrevista)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link
                        to={`/ovs/${ov.id}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border-subtle">
          {ordens?.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-subtle italic">
              Nenhuma ordem encontrada.
            </div>
          ) : (
            ordens?.map((ov) => (
              <div
                key={ov.id}
                className="p-4 space-y-3 hover:bg-hover transition-colors active:bg-hover-strong"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/ovs/${ov.id}`}
                      className="text-sm font-bold text-text font-mono hover:text-accent transition-colors"
                    >
                      {ov.numero}
                    </Link>
                    <p className="text-xs text-text-muted font-medium mt-0.5 truncate">
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
                      Transporte
                    </span>
                    <p className="text-text-subtle mt-0.5 truncate">
                      {ov.nomeTransporte}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">
                      Valor
                    </span>
                    <p className="font-bold text-accent font-mono mt-0.5">
                      {formatCurrency(ov.valorTotal)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">
                      Previsão
                    </span>
                    <p className="text-text-subtle font-mono mt-0.5">
                      {formatDate(ov.dataEntregaPrevista)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border-subtle">
                  <Link
                    to={`/ovs/${ov.id}`}
                    className="inline-flex items-center justify-center min-w-[44px] h-11 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
