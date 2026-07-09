import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPost } from "../api/fetch";
import type { Item } from "../domain/types";

export function Itens() {
  const { data: itens, loading, refresh } = useFetch<Item[]>("/itens");
  const podeCriar = usePermissao("itens:criar");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (loading) return <p role="status" aria-live="polite" className="text-gray-500">Carregando...</p>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string | number> = {
      nome: fd.get("nome") as string,
      sku: fd.get("sku") as string,
      categoria: fd.get("categoria") as string,
      precoUnitario: parseFloat(fd.get("preco") as string),
      unidadeMedida: fd.get("unidade") as string,
    };

    try {
      await apiPost("/itens", body);
      setMostrarForm(false);
      refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Itens</h1>
        {podeCriar && (
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 text-sm"
          >
            {mostrarForm ? "Cancelar" : "Novo Item"}
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nome</label>
            <input name="nome" required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">SKU</label>
            <input name="sku" required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Categoria</label>
            <input name="categoria" required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Preço Unitário</label>
            <input name="preco" type="number" step="0.01" min="0" required className="w-full border rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Unidade de Medida</label>
            <select name="unidade" required className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="un">Unidade</option>
              <option value="kg">Quilograma</option>
              <option value="m">Metro</option>
              <option value="l">Litro</option>
            </select>
          </div>
          {erro && <p role="alert" className="text-red-500 text-sm">{erro}</p>}
          <div>
            <button type="submit" className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700">
              Criar Item
            </button>
          </div>
        </form>
      )}

      <div role="region" aria-label="Lista de itens" className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Lista de itens</caption>
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço Unit.</th>
              <th className="p-3">Unidade</th>
              <th className="p-3">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {itens?.map((i) => (
              <tr key={i.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{i.nome}</td>
                <td className="p-3">{i.sku}</td>
                <td className="p-3">{i.categoria}</td>
                <td className="p-3">R$ {i.precoUnitario.toFixed(2)}</td>
                <td className="p-3">{i.unidadeMedida}</td>
                <td className="p-3">{i.ativo ? "Sim" : "Não"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
