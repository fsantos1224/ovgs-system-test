import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPost, apiPatch } from "../api/fetch";
import type { Cliente } from "../domain/types";

export function Clientes() {
  const { data: clientes, loading, refresh } = useFetch<Cliente[]>("/clientes");
  const podeCriar = usePermissao("clientes:criar");
  const podeEditar = usePermissao("clientes:editar");
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
      documento: fd.get("documento") as string,
      email: fd.get("email") as string,
      telefone: fd.get("telefone") as string,
      endereco: fd.get("endereco") as string,
    };

    try {
      if (editandoId) {
        await apiPatch(`/clientes/${editandoId}`, body);
      } else {
        await apiPost("/clientes", body);
      }
      setEditandoId(null);
      setMostrarForm(false);
      refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const iniciarEdicao = (c: Cliente) => {
    setEditandoId(c.id);
    setMostrarForm(true);
  };

  const clienteEditando = editandoId ? clientes?.find((c) => c.id === editandoId) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        {podeCriar && (
          <button
            onClick={() => { setMostrarForm(!mostrarForm); setEditandoId(null); }}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 text-sm"
          >
            {mostrarForm ? "Cancelar" : "Novo Cliente"}
          </button>
        )}
      </div>

      {(mostrarForm || editandoId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nome</label>
            <input name="nome" defaultValue={clienteEditando?.nome ?? ""} required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Documento</label>
            <input name="documento" defaultValue={clienteEditando?.documento ?? ""} required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Email</label>
            <input name="email" type="email" defaultValue={clienteEditando?.email ?? ""} required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Telefone</label>
            <input name="telefone" defaultValue={clienteEditando?.telefone ?? ""} className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Endereço</label>
            <input name="endereco" defaultValue={clienteEditando?.endereco ?? ""} className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          {erro && <p role="alert" className="text-red-500 text-sm col-span-2">{erro}</p>}
          <div className="col-span-2">
            <button type="submit" className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700">
              {editandoId ? "Salvar Alterações" : "Criar Cliente"}
            </button>
          </div>
        </form>
      )}

      <div role="region" aria-label="Lista de clientes" className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Lista de clientes</caption>
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Documento</th>
              <th className="p-3">Email</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Ativo</th>
              {podeEditar && <th className="p-3"></th>}
            </tr>
          </thead>
          <tbody>
            {clientes?.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{c.nome}</td>
                <td className="p-3">{c.documento}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.telefone}</td>
                <td className="p-3">{c.ativo ? "Sim" : "Não"}</td>
                {podeEditar && (
                  <td className="p-3">
                    <button onClick={() => iniciarEdicao(c)} className="text-blue-600 hover:underline text-sm">
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
