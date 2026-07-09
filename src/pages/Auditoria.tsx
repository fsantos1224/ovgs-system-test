import {
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { usePermissao } from "../hooks/usePermission";
import type { EventoAuditoria } from "../domain/types";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("pt-BR");
}

export function Auditoria() {
  const podeVer = usePermissao("auditoria:ver");
  const { data: eventos, loading } =
    useFetch<EventoAuditoria[]>("/eventosAuditoria");

  if (!podeVer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="border-b border-border pb-6">
          <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">
            Auditoria / TRANSAÇÕES E AUDITORIA
          </span>
          <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">
            Auditoria
          </h1>
        </div>
        <div
          role="alert"
          className="bg-surface rounded-xl border border-border p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-bold text-text">Acesso negado</h2>
          </div>
          <p className="text-text-muted text-sm">
            Você não tem permissão para visualizar a auditoria do sistema.
          </p>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">
          Auditoria / TRANSAÇÕES E AUDITORIA
        </span>
        <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">
          Auditoria
        </h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Histórico de ações e transações efetuadas no sistema.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">
              Eventos de auditoria do sistema
            </caption>
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-6 py-4.5">Data/Hora</th>
                <th className="px-6 py-4.5">Usuário</th>
                <th className="px-6 py-4.5">Entidade</th>
                <th className="px-6 py-4.5">Ação</th>
                <th className="px-6 py-4.5">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {eventos?.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-hover transition-colors"
                  >
                    <td className="px-6 py-4.5 text-text-muted font-mono">
                      {formatDateTime(e.dataHora)}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-hover border border-border flex items-center justify-center shrink-0">
                          <UserIcon
                            className="w-3 h-3 text-text-faint"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-text font-mono text-[11px]">
                          {e.usuario}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="font-bold text-text-muted bg-hover border border-border px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider">
                        {e.entidade}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-mono text-[11px] text-text font-bold">
                      {e.acao}
                    </td>
                    <td className="px-6 py-4.5 text-text-muted">
                      {e.detalhes}
                    </td>
                  </tr>
                ))}
              {eventos?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-text-subtle italic"
                  >
                    Nenhum evento de auditoria registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
