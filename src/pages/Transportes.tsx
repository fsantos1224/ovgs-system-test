import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPost, apiPatch } from "../api/fetch";
import { Modal } from "../components/Modal";
import type { TipoTransporte } from "../domain/types";

export function Transportes() {
  const { data: transportes, loading, refresh } = useFetch<TipoTransporte[]>("/tiposTransporte");
  const podeCriar = usePermissao("transportes:criar");
  const podeEditar = usePermissao("transportes:editar");
  const [editando, setEditando] = useState<TipoTransporte | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (loading) return <p role="status" aria-live="polite" className="text-gray-500">Carregando...</p>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string | boolean> = {
      nome: fd.get("nome") as string,
      modal: fd.get("modal") as string,
      ativo: fd.get("ativo") === "true",
    };

    try {
      if (editando) {
        await apiPatch(`/tiposTransporte/${editando.id}`, body);
      } else {
        await apiPost("/tiposTransporte", body);
      }
      setEditando(null);
      setMostrarForm(false);
      refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tipos de Transporte</h1>
        {podeCriar && (
          <button
            onClick={() => { setMostrarForm(true); setEditando(null); setErro(""); }}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 text-sm"
          >
            Novo Transporte
          </button>
        )}
      </div>

      <Modal open={mostrarForm} title={editando ? `Editar Transporte: ${editando.nome}` : "Novo Transporte"} onClose={() => { setMostrarForm(false); setEditando(null); setErro(""); }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nome</label>
            <input name="nome" defaultValue={editando?.nome ?? ""} required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Modal</label>
            <select name="modal" defaultValue={editando?.modal ?? "rodoviario"} className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="rodoviario">Rodoviário</option>
              <option value="aereo">Aéreo</option>
              <option value="maritimo">Marítimo</option>
              <option value="ferroviario">Ferroviário</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Ativo</label>
            <select name="ativo" defaultValue={editando?.ativo ? "true" : "false"} className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          {erro && <p role="alert" className="text-red-500 text-sm">{erro}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setMostrarForm(false); setEditando(null); setErro(""); }} className="text-sm text-slate-500 px-3 py-1.5 hover:underline">Cancelar</button>
            <button type="submit" className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700">
              {editando ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>

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
                    <button onClick={() => { setEditando(t); setMostrarForm(true); setErro(""); }} className="text-blue-600 hover:underline text-sm">
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
