import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPatch } from "../api/fetch";
import type { OrdemVenda } from "../domain/types";
import { statusLabel } from "../domain/types";
import { trackEvent } from "../lib/telemetry";

const STATUS_BADGE: Record<string, string> = {
  CRIADA: "dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 bg-zinc-100 text-zinc-700 border-zinc-300",
  PLANEJADA: "dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500/20 bg-amber-50 text-amber-700 border-amber-200",
  AGENDADA: "dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-500/20 bg-sky-50 text-sky-700 border-sky-200",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

export function Agendamento() {
  const { data: ordens, loading, refresh } = useFetch<OrdemVenda[]>("/ordensVenda");
  const podeAgendar = usePermissao("agendamento:criar");
  const podeVer = usePermissao("agendamento:ver");
  const [editando, setEditando] = useState<string | null>(null);

  if (loading) return <p role="status" aria-live="polite" className="text-text-muted p-6">Carregando...</p>;
  if (!podeVer) return <p className="text-text-muted p-6">Sem permissão para acessar esta página.</p>;

  const agendaveis = ordens?.filter((o) => o.status === "PLANEJADA" || o.status === "AGENDADA") ?? [];

  const handleSalvar = async (ov: OrdemVenda, form: HTMLFormElement) => {
    const fd = new FormData(form);
    const dataEntregaPrevista = fd.get("dataEntrega") as string;
    const janelaAtendimento = fd.get("janela") as string;
    const body: Record<string, string> = {};
    if (dataEntregaPrevista) body.dataEntregaPrevista = new Date(dataEntregaPrevista).toISOString();
    if (janelaAtendimento) body.janelaAtendimento = janelaAtendimento;
    if (ov.status === "PLANEJADA") body.status = "AGENDADA";

    try {
      await apiPatch(`/ordensVenda/${ov.id}`, body);
      trackEvent("ov:agendar", "ordem_venda", { ovId: ov.id, dataEntregaPrevista, janelaAtendimento });
      setEditando(null);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar agendamento");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">VOL. 03 / AGENDA E OPERAÇÃO</span>
        <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">Central de Agendamento</h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Agende e organize janelas de entrega para ordens planejadas.
        </p>
      </div>

      {agendaveis.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-text-subtle italic">
          Nenhuma ordem necessitando de agendamento no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agendaveis.map((ov) => {
            const editandoAgora = editando === ov.id;
            const isScheduled = ov.status === "AGENDADA";
            return (
              <div key={ov.id} className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between hover:border-border-strong transition-all duration-200 shadow-xl">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-bold text-text font-mono">{ov.numero}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[ov.status]}`}>
                      {statusLabel(ov.status)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text mt-3.5 truncate">{ov.nomeCliente}</h3>
                </div>

                <div className="space-y-2.5 border-t border-b border-border-subtle py-4 my-3 text-xs">
                  <div className="flex items-center gap-2.5 text-text-muted font-mono">
                    <Calendar className="w-4 h-4 text-text-faint" aria-hidden="true" />
                    <span>Data prevista: <strong className="text-text font-bold">{formatDate(ov.dataEntregaPrevista)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-muted font-mono">
                    <Clock className="w-4 h-4 text-text-faint" aria-hidden="true" />
                    <span>Janela: <strong className={ov.janelaAtendimento ? "text-accent font-bold" : "text-text-faint"}>{ov.janelaAtendimento || "—"}</strong></span>
                  </div>
                </div>

                {editandoAgora ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSalvar(ov, e.currentTarget);
                    }}
                    className="space-y-3"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block">Data</label>
                      <input
                        type="date"
                        name="dataEntrega"
                        defaultValue={ov.dataEntregaPrevista?.split("T")[0] ?? ""}
                        required
                        className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block">Janela</label>
                      <input
                        type="text"
                        name="janela"
                        placeholder="ex: 08:00-12:00"
                        defaultValue={ov.janelaAtendimento ?? ""}
                        className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden placeholder:text-text-faint"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditando(null)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-widest font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-surface-elevated hover:bg-accent hover:text-on-accent border border-border-strong text-text text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        {isScheduled ? "Reagendar" : "Confirmar"}
                      </button>
                    </div>
                  </form>
                ) : (
                  podeAgendar && (
                    <button
                      onClick={() => setEditando(ov.id)}
                      className={`w-full text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-accent ${
                        isScheduled
                          ? "border border-border-strong hover:bg-accent hover:text-on-accent hover:border-accent text-text"
                          : "bg-surface-elevated hover:bg-accent hover:text-on-accent text-text border border-border-strong"
                      }`}
                    >
                      {isScheduled ? "Reagendar" : "Agendar"}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}