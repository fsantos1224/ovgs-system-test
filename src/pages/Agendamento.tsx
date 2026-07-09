import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import { apiPatch } from "../api/fetch";
import type { OrdemVenda } from "../domain/types";
import { statusLabel } from "../domain/types";
import { trackEvent } from "../lib/telemetry";

export function Agendamento() {
  const { data: ordens, loading, refresh } = useFetch<OrdemVenda[]>("/ordensVenda");
  const podeAgendar = usePermissao("agendamento:criar");
  const podeVer = usePermissao("agendamento:ver");
  const [editando, setEditando] = useState<string | null>(null);

  if (loading) return <p role="status" aria-live="polite" className="text-slate-500">Carregando...</p>;
  if (!podeVer) return <p className="text-slate-500">Sem permissão para acessar esta página.</p>;

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Central de Agendamento</h1>

      {agendaveis.length === 0 ? (
        <p className="text-slate-500">Nenhuma OV pendente de agendamento.</p>
      ) : (
        <div className="space-y-4">
          {agendaveis.map((ov) => {
            const editandoAgora = editando === ov.id;
            return (
              <div key={ov.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium">{ov.numero}</span>
                    <span className="text-slate-500 text-sm ml-2">{ov.nomeCliente}</span>
                    <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${ov.status === "AGENDADA" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {statusLabel(ov.status)}
                    </span>
                  </div>
                  {podeAgendar && (
                    <button
                      onClick={() => setEditando(editandoAgora ? null : ov.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {editandoAgora ? "Cancelar" : ov.status === "AGENDADA" ? "Reagendar" : "Agendar"}
                    </button>
                  )}
                </div>

                {editandoAgora ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSalvar(ov, e.currentTarget);
                    }}
                    className="flex flex-wrap gap-3 items-end"
                  >
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Data de Entrega</label>
                      <input
                        type="date"
                        name="dataEntrega"
                        defaultValue={ov.dataEntregaPrevista?.split("T")[0] ?? ""}
                        required
                        className="border rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Janela de Atendimento</label>
                      <input
                        type="text"
                        name="janela"
                        placeholder="ex: 08:00-12:00"
                        defaultValue={ov.janelaAtendimento ?? ""}
                        className="border rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700"
                    >
                      {ov.status === "AGENDADA" ? "Reagendar" : "Confirmar Agendamento"}
                    </button>
                  </form>
                ) : (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>
                      <span className="text-slate-400">Data prevista:</span>{" "}
                      {ov.dataEntregaPrevista ? new Date(ov.dataEntregaPrevista).toLocaleDateString("pt-BR") : "—"}
                    </p>
                    <p>
                      <span className="text-slate-400">Janela:</span>{" "}
                      {ov.janelaAtendimento || "—"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
