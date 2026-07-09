import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar } from "lucide-react";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";
import { useFetch } from "../hooks/useFetch";
import type {
  OrdemVenda,
  Cliente,
  TipoTransporte,
  OVStatus,
} from "../domain/types";
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

  const { data: clientes } = useFetch<Cliente[]>("/clientes");
  const { data: transportes } = useFetch<TipoTransporte[]>("/tiposTransporte");

  const {
    data: ordens,
    loading,
    page,
    totalPages,
    setPage,
    setFilters,
  } = usePaginatedFetch<OrdemVenda[]>("/ordensVenda", 10);

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

  const montarFiltros = useCallback(() => {
    const f: Record<string, string> = {};
    if (debouncedSearch) f.q = debouncedSearch;
    if (filtroStatus) f.status = filtroStatus;
    if (filtroCliente) f.nomeCliente_like = filtroCliente;
    if (filtroTransporte) f.nomeTransporte_like = filtroTransporte;
    if (dataDe) f.dataEntregaPrevista_gte = dataDe;
    if (dataAte) f.dataEntregaPrevista_lte = dataAte;
    return f;
  }, [
    debouncedSearch,
    filtroStatus,
    filtroCliente,
    filtroTransporte,
    dataDe,
    dataAte,
  ]);

  useEffect(() => {
    setFilters(montarFiltros());
    setPage(1);
  }, [montarFiltros, setFilters, setPage]);

  if (loading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">
            Ordens de Venda / FLUXO DE TRANSAÇÕES
          </span>
          <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">
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
      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        {/* Linha 1 — filtros estruturais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="flex flex-nowrap items-center gap-2"
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

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-6 py-4.5">Número</th>
                <th className="px-6 py-4.5">Cliente</th>
                <th className="px-6 py-4.5">Transporte</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5 text-right">Valor Total</th>
                <th className="px-6 py-4.5">Previsão</th>
                <th className="px-6 py-4.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {ordens?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-text-subtle italic"
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
                    <td className="px-6 py-4 font-bold text-text font-mono">
                      {ov.numero}
                    </td>
                    <td className="px-6 py-4 text-text-muted font-medium">
                      {ov.nomeCliente}
                    </td>
                    <td className="px-6 py-4 text-text-subtle">
                      {ov.nomeTransporte}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[ov.status]}`}
                      >
                        {statusLabel(ov.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-accent font-mono">
                      {formatCurrency(ov.valorTotal)}
                    </td>
                    <td className="px-6 py-4 text-text-subtle font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar
                          className="w-3.5 h-3.5 text-text-faint"
                          aria-hidden="true"
                        />
                        {formatDate(ov.dataEntregaPrevista)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/ovs/${ov.id}`}
                        className="text-[10px] uppercase tracking-widest border border-border-strong hover:bg-accent hover:text-on-accent hover:border-accent px-3 py-1.5 transition-all font-bold focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
