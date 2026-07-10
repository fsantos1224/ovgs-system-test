import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useClientes, useCriarCliente, useAtualizarCliente, useExcluirCliente } from "../queries";
import { usePermissao } from "../hooks/usePermission";
import { useConfirm } from "../hooks/useConfirm";
import { Modal } from "../components/Modal";
import { clienteSchema } from "../lib/validation";
import type { Cliente } from "../domain/types";

function formatDocumento(val: string): string {
  const d = val.replace(/\D/g, "");
  if (d.length <= 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").slice(0, 18);
}

function formatTelefone(val: string): string {
  const d = val.replace(/\D/g, "");
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3").slice(0, 14);
  return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").slice(0, 15);
}

export function Clientes() {
  const { data: clientes, isLoading } = useClientes();
  const criarCliente = useCriarCliente();
  const atualizarCliente = useAtualizarCliente();
  const excluirCliente = useExcluirCliente();
  const confirm = useConfirm();
  const podeCriar = usePermissao("clientes:criar");
  const podeEditar = usePermissao("clientes:editar");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (isLoading) return <p role="status" aria-live="polite" className="text-text-muted p-6">Carregando...</p>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const raw = {
      nome: (fd.get("nome") as string) || "",
      documento: ((fd.get("documento") as string) || "").replace(/\D/g, ""),
      email: (fd.get("email") as string) || "",
      telefone: ((fd.get("telefone") as string) || "").replace(/\D/g, ""),
      endereco: (fd.get("endereco") as string) || "",
      ativo: fd.get("ativo") === "true",
    };

    const parsed = clienteSchema.safeParse(raw);
    if (!parsed.success) { setErro(parsed.error.issues[0].message); return; }

    try {
      if (editando) {
        await atualizarCliente.mutateAsync({ id: editando.id, data: parsed.data });
      } else {
        await criarCliente.mutateAsync(parsed.data);
      }
      setEditando(null);
      setMostrarForm(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Excluir Cliente", body: "Tem certeza que deseja excluir este cliente?", confirmLabel: "Excluir", cancelLabel: "Cancelar", variant: "danger" });
    if (!ok) return;
    try {
      await excluirCliente.mutateAsync(id);
    } catch {
      alert("Erro ao excluir cliente.");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">Clientes / CARTEIRA DE LOGÍSTICA</span>
          <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">Clientes</h1>
          <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">Cadastre, edite e consulte a base de clientes.</p>
        </div>
        {podeCriar && (
          <button onClick={() => { setMostrarForm(true); setEditando(null); setErro(""); }} className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent">
            <Plus className="w-4 h-4" aria-hidden="true" /> Novo Cliente
          </button>
        )}
      </div>

      <Modal open={mostrarForm} title={editando ? `Editar Cliente: ${editando.nome}` : "Novo Cliente"} onClose={() => { setMostrarForm(false); setEditando(null); setErro(""); }}>
        <form key={editando?.id ?? "new"} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Nome</label>
              <input name="nome" defaultValue={editando?.nome ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Documento</label>
              <input name="documento" defaultValue={editando ? formatDocumento(editando.documento) : ""} required onInput={(e) => { e.currentTarget.value = formatDocumento(e.currentTarget.value); }} className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Email</label>
              <input name="email" type="email" defaultValue={editando?.email ?? ""} required className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">Telefone</label>
              <input name="telefone" defaultValue={editando ? formatTelefone(editando.telefone) : ""} onInput={(e) => { e.currentTarget.value = formatTelefone(e.currentTarget.value); }} className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden" />
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

      {/* Desktop table */}
      <div role="region" aria-label="Lista de clientes" className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <caption className="sr-only">Lista de clientes</caption>
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-4 py-4 w-[28%]">Nome</th>
                <th className="px-4 py-4 w-[18%]">Documento</th>
                <th className="px-4 py-4 w-[22%]">Email</th>
                <th className="px-4 py-4 w-[16%]">Telefone</th>
                <th className="px-4 py-4 w-[8%]">Ativo</th>
                {podeEditar && <th className="px-4 py-4 w-[8%] text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {clientes?.map((c) => (
                <tr key={c.id} className="hover:bg-hover transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-text text-sm truncate">{c.nome}</div>
                    {c.endereco && <div className="text-[11px] text-text-faint mt-0.5 truncate max-w-[200px]">{c.endereco}</div>}
                  </td>
                  <td className="px-4 py-4 text-text-muted font-mono font-medium truncate">{c.documento ? formatDocumento(c.documento) : "—"}</td>
                  <td className="px-4 py-4 text-text-muted font-medium truncate">{c.email || "—"}</td>
                  <td className="px-4 py-4 text-text-subtle font-mono truncate">{c.telefone ? formatTelefone(c.telefone) : "—"}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${c.ativo ? "text-emerald-500" : "text-text-faint"}`}>
                      {c.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {podeEditar && (
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => { setEditando(c); setMostrarForm(true); setErro(""); }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {clientes?.length === 0 && <tr><td colSpan={podeEditar ? 6 : 5} className="px-4 py-12 text-center text-text-subtle italic">Nenhum cliente cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border-subtle">
          {clientes?.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-subtle italic">Nenhum cliente cadastrado.</div>
          ) : (
            clientes?.map((c) => (
              <div key={c.id} className="p-4 space-y-3 hover:bg-hover transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text text-sm">{c.nome}</p>
                    {c.endereco && <p className="text-[11px] text-text-faint mt-0.5 truncate">{c.endereco}</p>}
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${c.ativo ? "text-emerald-500" : "text-text-faint"}`}>
                    {c.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Documento</span>
                    <p className="text-text-muted font-mono mt-0.5">{c.documento ? formatDocumento(c.documento) : "—"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Telefone</span>
                    <p className="text-text-subtle font-mono mt-0.5">{c.telefone ? formatTelefone(c.telefone) : "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Email</span>
                    <p className="text-text-muted mt-0.5 truncate">{c.email || "—"}</p>
                  </div>
                </div>
                {podeEditar && (
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-border-subtle">
                    <button
                      onClick={() => { setEditando(c); setMostrarForm(true); setErro(""); }}
                      className="inline-flex items-center justify-center min-w-[44px] h-11 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center justify-center min-w-[44px] h-11 rounded-md text-text-faint hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
