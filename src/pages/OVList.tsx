import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";
import { useFetch } from "../hooks/useFetch";
import type { OrdemVenda, Cliente, TipoTransporte } from "../domain/types";
import { statusLabel, STATUS_FLOW } from "../domain/types";
import { usePermissao } from "../hooks/usePermission";
import { Pagination } from "../components/Pagination";

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
  } = usePaginatedFetch<OrdemVenda[]>("/ordensVenda", 20);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const montarFiltros = useCallback(() => {
    const f: Record<string, string> = {};
    if (debouncedSearch) f.q = debouncedSearch;
    if (filtroStatus) f.status = filtroStatus;
    if (filtroCliente) f.nomeCliente_like = filtroCliente;
    if (filtroTransporte) f.nomeTransporte_like = filtroTransporte;
    if (dataDe) f.dataEntregaPrevista_gte = dataDe;
    if (dataAte) f.dataEntregaPrevista_lte = dataAte;
    return f;
  }, [debouncedSearch, filtroStatus, filtroCliente, filtroTransporte, dataDe, dataAte]);

  useEffect(() => {
    setFilters(montarFiltros());
    setPage(1);
  }, [montarFiltros, setFilters, setPage]);

  if (loading)
    return (
      <p role="status" aria-live="polite" className="text-slate-500">
        Carregando...
      </p>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Ordens de Venda</h1>
        {podeCriar && (
          <Link
            to="/ovs/nova"
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors text-sm"
          >
            Nova OV
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Cliente</label>
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Transporte</label>
          <select
            value={filtroTransporte}
            onChange={(e) => setFiltroTransporte(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {transportes?.map((t) => (
              <option key={t.id} value={t.nome}>{t.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Data prevista de</label>
          <input
            type="date"
            value={dataDe}
            onChange={(e) => setDataDe(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">até</label>
          <input
            type="date"
            value={dataAte}
            onChange={(e) => setDataAte(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Buscar por número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm w-48"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Número</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Transporte</th>
              <th className="p-3">Status</th>
              <th className="p-3">Valor Total</th>
              <th className="p-3">Previsão</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {ordens?.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  Nenhuma ordem encontrada.
                </td>
              </tr>
            ) : (
              ordens?.map((ov) => (
                <tr key={ov.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{ov.numero}</td>
                  <td className="p-3">{ov.nomeCliente}</td>
                  <td className="p-3">{ov.nomeTransporte}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-200">
                      {statusLabel(ov.status)}
                    </span>
                  </td>
                  <td className="p-3">R$ {ov.valorTotal.toFixed(2)}</td>
                  <td className="p-3">
                    {new Date(ov.dataEntregaPrevista).toLocaleDateString(
                      "pt-BR",
                    )}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/ovs/${ov.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
