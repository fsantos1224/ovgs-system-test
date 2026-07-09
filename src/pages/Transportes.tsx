import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPost, apiPatch } from "../api/fetch";
import type { TipoTransporte } from "../domain/types";

export function Transportes() {
  const { data: transportes, loading, refresh } = useFetch<TipoTransporte[]>("/tiposTransporte");
  const podeCriar = usePermissao("transportes:criar");
  const podeEditar = usePermissao("transportes:editar");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (loading) return <p role="status" aria-live="polite" className="text-gray-500">Carregando...</p>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      nome: fd.get("nome") as string,
      modal: fd.get("modal") as string,
    };

    try {
      if (editandoId) {
        await apiPatch(`/tiposTransporte/${editandoId}`, body);
      } else {
        await apiPost("/tiposTransporte", body);
      }
      setEditandoId(null);
      setMostrarForm(false);
      refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const itemEditando = editandoId ? transportes?.find((t) => t.id === editandoId) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tipos de Transporte</h1>
        {podeCriar && (
          <button
            onClick={() => { setMostrarForm(!mostrarForm); setEditandoId(null); }}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 text-sm"
          >
            {mostrarForm ? "Cancelar" : "Novo Transporte"}
          </button>
        )}
      </div>

      {(mostrarForm || editandoId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nome</label>
            <input name="nome" defaultValue={itemEditando?.nome ?? ""} required className="border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Modal</label>
            <select name="modal" defaultValue={itemEditando?.modal ?? "rodoviario"} className="border rounded px-2 py-1.5 text-sm">
              <option value="rodoviario">Rodoviário</option>
              <option value="aereo">Aéreo</option>
              <option value="maritimo">Marítimo</option>
              <option value="ferroviario">Ferroviário</option>
            </select>
          </div>
          {erro && <p role="alert" className="text-red-500 text-sm">{erro}</p>}
          <button type="submit" className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700">
            {editandoId ? "Salvar" : "Criar"}
          </button>
        </form>
      )}

      <div role="region" aria-label="Lista de tipos de transporte" className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Lista de tipos de transporte</caption>
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Modal</th>
              <th className="p-3">Ativo</th>
              {podeEditar && <th className="p-3"></th>}
            </tr>
          </thead>
          <tbody>
            {transportes?.map((t) => (
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{t.nome}</td>
                <td className="p-3">{t.modal}</td>
                <td className="p-3">{t.ativo ? "Sim" : "Não"}</td>
                {podeEditar && (
                  <td className="p-3">
                    <button onClick={() => { setEditandoId(t.id); setMostrarForm(true); }} className="text-blue-600 hover:underline text-sm">
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
