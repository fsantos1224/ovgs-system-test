import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPost, apiPatch } from "../api/fetch";
import { Modal } from "../components/Modal";
import type { Cliente } from "../domain/types";

export function Clientes() {
  const { data: clientes, loading, refresh } = useFetch<Cliente[]>("/clientes");
  const podeCriar = usePermissao("clientes:criar");
  const podeEditar = usePermissao("clientes:editar");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (loading) return <p role="status" aria-live="polite" className="text-text-muted p-6">Carregando...</p>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string | boolean> = {
      nome: fd.get("nome") as string,
      documento: fd.get("documento") as string,
      email: fd.get("email") as string,
      telefone: fd.get("telefone") as string,
      endereco: fd.get("endereco") as string,
      ativo: fd.get("ativo") === "true",
    };

    try {
      if (editando) {
        await apiPatch(`/clientes/${editando.id}`, body);
      } else {
        await apiPost("/clientes", body);
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
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">VOL. 04 / CARTEIRA DE LOGÍSTICA</span>
          <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">Clientes</h1>
          <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">Cadastre, edite e consulte a base de clientes.</p>
        </div>
        {podeCriar && (
          <button
            onClick={() => { setMostrarForm(true); setEditando(null); setErro(""); }}
            className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Novo Cliente
          </button>
        )}
      </div>

      <Modal open={mostrarForm} title={editando ? `Editar Cliente: ${editando.nome}` : "Novo Cliente"} onClose={() => { setMostrarForm(false); setEditando(null); setErro(""); }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Nome</label>
              <input name="nome" defaultValue={editando?.nome ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Documento</label>
              <input name="documento" defaultValue={editando?.documento ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Email</label>
              <input name="email" type="email" defaultValue={editando?.email ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Telefone</label>
              <input name="telefone" defaultValue={editando?.telefone ?? ""} className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Endereço</label>
            <input name="endereco" defaultValue={editando?.endereco ?? ""} className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Ativo</label>
            <select name="ativo" defaultValue={editando ? (editando.ativo ? "true" : "false") : "true"} className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer">
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          {erro && <p role="alert" className="text-rose-400 text-xs">{erro}</p>}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button type="button" onClick={() => { setMostrarForm(false); setEditando(null); setErro(""); }} className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-surface-elevated hover:bg-accent text-text hover:text-on-accent font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-lg transition-all border border-border-strong focus-visible:outline-2 focus-visible:outline-accent">
              {editando ? "Salvar Alterações" : "Criar Cliente"}
            </button>
          </div>
        </form>
      </Modal>

      <div role="region" aria-label="Lista de clientes" className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Lista de clientes</caption>
          <thead>
            <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
              <th className="px-6 py-4.5">Nome</th>
              <th className="px-6 py-4.5">Documento</th>
              <th className="px-6 py-4.5">Email</th>
              <th className="px-6 py-4.5">Telefone</th>
              <th className="px-6 py-4.5">Ativo</th>
              {podeEditar && <th className="px-6 py-4.5 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-xs">
            {clientes?.map((c) => (
              <tr key={c.id} className="hover:bg-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-text text-sm">{c.nome}</div>
                  {c.endereco && <div className="text-[11px] text-text-faint mt-0.5 truncate max-w-[200px]">{c.endereco}</div>}
                </td>
                <td className="px-6 py-4 text-text-muted font-mono font-medium">{c.documento || '—'}</td>
                <td className="px-6 py-4 text-text-muted font-medium">{c.email || '—'}</td>
                <td className="px-6 py-4 text-text-subtle font-mono">{c.telefone || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${c.ativo ? 'text-emerald-500' : 'text-text-faint'}`}>
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {podeEditar && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => { setEditando(c); setMostrarForm(true); setErro(""); }}
                      className="text-[10px] uppercase tracking-widest border border-border-strong hover:bg-accent hover:text-on-accent hover:border-accent px-3 py-1.5 transition-all font-bold inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {clientes?.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-text-subtle italic">Nenhum cliente cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}