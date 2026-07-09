import { useState } from "react";
import { Plus, Truck, Pencil, Trash2 } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPost, apiPatch, apiDelete } from "../api/fetch";
import { Modal } from "../components/Modal";
import { transporteSchema } from "../lib/validation";
import type { TipoTransporte } from "../domain/types";

const MODAL_LABEL: Record<string, string> = {
  rodoviario: "Rodoviário",
  aereo: "Aéreo",
  maritimo: "Marítimo",
  ferroviario: "Ferroviário",
};

export function Transportes() {
  const {
    data: transportes,
    loading,
    refresh,
  } = useFetch<TipoTransporte[]>("/tiposTransporte");
  const podeCriar = usePermissao("transportes:criar");
  const podeEditar = usePermissao("transportes:editar");
  const [editando, setEditando] = useState<TipoTransporte | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");

  if (loading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    const raw = {
      nome: (fd.get("nome") as string) || "",
      modal: (fd.get("modal") as string) || "",
      ativo: fd.get("ativo") === "true",
    };

    const parsed = transporteSchema.safeParse(raw);
    if (!parsed.success) { setErro(parsed.error.issues[0].message); return; }

    try {
      if (editando) {
        await apiPatch(`/tiposTransporte/${editando.id}`, parsed.data);
      } else {
        await apiPost("/tiposTransporte", parsed.data);
      }
      setEditando(null);
      setMostrarForm(false);
      refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este transporte?")) return;
    try {
      await apiDelete(`/tiposTransporte/${id}`);
      refresh();
    } catch {
      alert("Erro ao excluir transporte.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">
            Transportes / MODAIS LOGÍSTICOS
          </span>
          <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">
            Tipos de Transporte
          </h1>
          <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
            Cadastre e gerencie os modais de transporte disponíveis.
          </p>
        </div>
        {podeCriar && (
          <button
            onClick={() => {
              setMostrarForm(true);
              setEditando(null);
              setErro("");
            }}
            className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Novo Transporte
          </button>
        )}
      </div>

      <Modal
        open={mostrarForm}
        title={
          editando ? `Editar Transporte: ${editando.nome}` : "Novo Transporte"
        }
        onClose={() => {
          setMostrarForm(false);
          setEditando(null);
          setErro("");
        }}
      >
        <form key={editando?.id ?? "new"} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">
              Nome
            </label>
            <input
              name="nome"
              defaultValue={editando?.nome ?? ""}
              required
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">
              Modal
            </label>
            <select
              name="modal"
              defaultValue={editando?.modal ?? "rodoviario"}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="rodoviario">Rodoviário</option>
              <option value="aereo">Aéreo</option>
              <option value="maritimo">Marítimo</option>
              <option value="ferroviario">Ferroviário</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1.5">
              Ativo
            </label>
            <select
              name="ativo"
              defaultValue={editando?.ativo ? "true" : "false"}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          {erro && (
            <p role="alert" className="text-rose-400 text-xs">
              {erro}
            </p>
          )}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setMostrarForm(false);
                setEditando(null);
                setErro("");
              }}
              className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-surface-elevated hover:bg-accent text-text hover:text-on-accent font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-lg transition-all border border-border-strong focus-visible:outline-2 focus-visible:outline-accent"
            >
              {editando ? "Salvar Alterações" : "Criar Transporte"}
            </button>
          </div>
        </form>
      </Modal>

      <div
        role="region"
        aria-label="Lista de tipos de transporte"
        className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl"
      >
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Lista de tipos de transporte</caption>
          <thead>
            <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
              <th className="px-6 py-4.5">Nome</th>
              <th className="px-6 py-4.5">Modal</th>
              <th className="px-6 py-4.5">Ativo</th>
              {podeEditar && <th className="px-6 py-4.5 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-xs">
            {transportes?.map((t) => (
              <tr key={t.id} className="hover:bg-hover transition-colors">
                <td className="px-6 py-4 font-bold text-text text-sm inline-flex items-center gap-2">
                  <Truck
                    className="w-3.5 h-3.5 text-text-faint"
                    aria-hidden="true"
                  />
                  {t.nome}
                </td>
                <td className="px-6 py-4 text-text-muted">
                  {MODAL_LABEL[t.modal] ?? t.modal}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${t.ativo ? "text-emerald-500" : "text-text-faint"}`}
                  >
                    {t.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                {podeEditar && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => { setEditando(t); setMostrarForm(true); setErro(""); }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
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
            {transportes?.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-text-subtle italic"
                >
                  Nenhum transporte cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
