import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useItens, useCriarItem, useAtualizarItem, useExcluirItem } from "../queries";
import { usePermissao } from "../hooks/usePermission";
import { useConfirm } from "../hooks/useConfirm";
import { Modal } from "../components/Modal";
import { itemSchema } from "../lib/validation";
import type { Item } from "../domain/types";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val / 100);
}

export function Itens() {
  const { data: itens, isLoading } = useItens();
  const criarItem = useCriarItem();
  const atualizarItem = useAtualizarItem();
  const excluirItem = useExcluirItem();
  const confirm = useConfirm();
  const podeCriar = usePermissao("itens:criar");
  const [editando, setEditando] = useState<Item | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (isLoading) return <p role="status" aria-live="polite" className="text-text-muted p-6">Carregando...</p>;

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Excluir Item", body: "Tem certeza que deseja excluir este item?", confirmLabel: "Excluir", cancelLabel: "Cancelar", variant: "danger" });
    if (!ok) return;
    try {
      await excluirItem.mutateAsync(id);
    } catch {
      alert("Erro ao excluir item.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const raw = {
      nome: (fd.get("nome") as string) || "",
      sku: (fd.get("sku") as string) || "",
      categoria: (fd.get("categoria") as string) || "",
      precoUnitario: parseFloat(fd.get("preco") as string) || 0,
      unidadeMedida: (fd.get("unidade") as string) || "un",
      ativo: fd.get("ativo") === "true",
    };

    const parsed = itemSchema.safeParse(raw);
    if (!parsed.success) { setErro(parsed.error.issues[0].message); return; }

    try {
      if (editando) {
        await atualizarItem.mutateAsync({ id: editando.id, data: parsed.data });
      } else {
        await criarItem.mutateAsync(parsed.data);
      }
      setEditando(null);
      setMostrarForm(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">Itens / CATÁLOGO DE ATIVOS</span>
          <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">Itens</h1>
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
        <form key={editando?.id ?? "new"} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Desktop table */}
      <div role="region" aria-label="Lista de itens" className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <caption className="sr-only">Lista de itens</caption>
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-4 py-4 w-[24%]">Nome</th>
                <th className="px-4 py-4 w-[14%]">SKU</th>
                <th className="px-4 py-4 w-[18%]">Categoria</th>
                <th className="px-4 py-4 w-[16%]">Preço Unit.</th>
                <th className="px-4 py-4 w-[10%]">Unidade</th>
                <th className="px-4 py-4 w-[10%]">Ativo</th>
                <th className="px-4 py-4 w-[8%] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {itens?.map((i) => (
                <tr key={i.id} className="hover:bg-hover transition-colors">
                  <td className="px-4 py-4 font-bold text-text text-sm truncate">{i.nome}</td>
                  <td className="px-4 py-4 text-text-muted font-mono font-medium truncate">{i.sku}</td>
                  <td className="px-4 py-4 text-text-subtle font-medium truncate">{i.categoria}</td>
                  <td className="px-4 py-4 font-bold text-accent font-mono truncate">{formatCurrency(i.precoUnitario)}</td>
                  <td className="px-4 py-4 font-mono text-text-muted font-medium">{i.unidadeMedida}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${i.ativo ? 'text-emerald-500' : 'text-text-faint'}`}>
                      {i.ativo ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => { setEditando(i); setMostrarForm(true); setErro(""); }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
                {itens?.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-text-subtle italic">Nenhum item cadastrado.</td></tr>
                )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border-subtle">
          {itens?.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-subtle italic">Nenhum item cadastrado.</div>
          ) : (
            itens?.map((i) => (
              <div key={i.id} className="p-4 space-y-3 hover:bg-hover transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text text-sm">{i.nome}</p>
                    <p className="text-text-muted font-mono text-xs mt-0.5">{i.sku}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${i.ativo ? 'text-emerald-500' : 'text-text-faint'}`}>
                    {i.ativo ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Categoria</span>
                    <p className="text-text-subtle mt-0.5">{i.categoria}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Preço</span>
                    <p className="font-bold text-accent font-mono mt-0.5">{formatCurrency(i.precoUnitario)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Unidade</span>
                    <p className="text-text-muted font-mono mt-0.5">{i.unidadeMedida}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border-subtle">
                  <button
                    onClick={() => { setEditando(i); setMostrarForm(true); setErro(""); }}
                    className="inline-flex items-center justify-center min-w-[44px] h-11 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="inline-flex items-center justify-center min-w-[44px] h-11 rounded-md text-text-faint hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
