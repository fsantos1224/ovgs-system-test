import { useState } from "react";
import { Plus } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPost, apiPatch } from "../api/fetch";
import { Modal } from "../components/Modal";
import type { Item } from "../domain/types";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

export function Itens() {
  const { data: itens, loading, refresh } = useFetch<Item[]>("/itens");
  const podeCriar = usePermissao("itens:criar");
  const podeEditar = usePermissao("itens:editar");
  const [editando, setEditando] = useState<Item | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (loading) return <p role="status" aria-live="polite" className="text-text-muted p-6">Carregando...</p>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string | number | boolean> = {
      nome: fd.get("nome") as string,
      sku: fd.get("sku") as string,
      categoria: fd.get("categoria") as string,
      precoUnitario: parseFloat(fd.get("preco") as string),
      unidadeMedida: fd.get("unidade") as string,
      ativo: fd.get("ativo") === "true",
    };

    try {
      if (editando) {
        await apiPatch(`/itens/${editando.id}`, body);
      } else {
        await apiPost("/itens", body);
      }
      setEditando(null);
      setMostrarForm(false);
      refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">VOL. 05 / CATÁLOGO DE ATIVOS</span>
          <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">Itens</h1>
          <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">Consulte e gerencie o catálogo de produtos comercializáveis.</p>
        </div>
        {podeCriar && (
          <button
            onClick={() => { setMostrarForm(true); setEditando(null); setErro(""); }}
            className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Novo Item
          </button>
        )}
      </div>

      <Modal open={mostrarForm} title={editando ? `Editar Item: ${editando.nome}` : "Novo Item"} onClose={() => { setMostrarForm(false); setEditando(null); setErro(""); }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Nome</label>
              <input name="nome" defaultValue={editando?.nome ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">SKU</label>
              <input name="sku" defaultValue={editando?.sku ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Categoria</label>
              <input name="categoria" defaultValue={editando?.categoria ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Preço Unitário</label>
              <input name="preco" type="number" step="0.01" min="0" defaultValue={editando?.precoUnitario ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Unidade</label>
              <select name="unidade" defaultValue={editando?.unidadeMedida ?? "un"} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer">
                <option value="un">Unidade</option>
                <option value="kg">Quilograma</option>
                <option value="m">Metro</option>
                <option value="l">Litro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Ativo</label>
              <select name="ativo" defaultValue={editando ? (editando.ativo ? "true" : "false") : "true"} className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer">
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>
          {erro && <p role="alert" className="text-rose-400 text-xs">{erro}</p>}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button type="button" onClick={() => { setMostrarForm(false); setEditando(null); setErro(""); }} className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-surface-elevated hover:bg-accent text-text hover:text-on-accent font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-lg transition-all border border-border-strong focus-visible:outline-2 focus-visible:outline-accent">
              {editando ? "Salvar Alterações" : "Criar Item"}
            </button>
          </div>
        </form>
      </Modal>

      <div role="region" aria-label="Lista de itens" className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Lista de itens</caption>
          <thead>
            <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
              <th className="px-6 py-4.5">Nome</th>
              <th className="px-6 py-4.5">SKU</th>
              <th className="px-6 py-4.5">Categoria</th>
              <th className="px-6 py-4.5">Preço Unit.</th>
              <th className="px-6 py-4.5">Unidade</th>
              <th className="px-6 py-4.5">Ativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-xs">
            {itens?.map((i) => (
              <tr key={i.id} className="hover:bg-hover transition-colors">
                <td className="px-6 py-4 font-bold text-text text-sm">{i.nome}</td>
                <td className="px-6 py-4 text-text-muted font-mono font-medium">{i.sku}</td>
                <td className="px-6 py-4 text-text-subtle font-medium">{i.categoria}</td>
                <td className="px-6 py-4 font-bold text-accent font-mono">{formatCurrency(i.precoUnitario)}</td>
                <td className="px-6 py-4 font-mono text-text-muted font-medium">{i.unidadeMedida}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${i.ativo ? 'text-emerald-500' : 'text-text-faint'}`}>
                    {i.ativo ? 'Disponível' : 'Indisponível'}
                  </span>
                </td>
              </tr>
            ))}
            {itens?.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-text-subtle italic">Nenhum item cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}