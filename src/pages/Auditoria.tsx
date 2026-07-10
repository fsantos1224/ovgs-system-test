import {
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { useEventosAuditoria } from "../queries";
import { usePermissao } from "../hooks/usePermission";
import { Breadcrumbs } from "../components/Breadcrumbs";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("pt-BR");
}

export function Auditoria() {
  const podeVer = usePermissao("auditoria:ver");
  const { data: eventos, isLoading } = useEventosAuditoria();

  if (!podeVer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="border-b border-border pb-6">
          <Breadcrumbs />
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

  if (isLoading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="border-b border-border pb-4 md:pb-6">
        <Breadcrumbs />
        <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">
          Auditoria
        </h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Histórico de ações e transações efetuadas no sistema.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <caption className="sr-only">
              Eventos de auditoria do sistema
            </caption>
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-4 py-4 w-[18%]">Data/Hora</th>
                <th className="px-4 py-4 w-[22%]">Usuário</th>
                <th className="px-4 py-4 w-[12%]">Entidade</th>
                <th className="px-4 py-4 w-[10%]">Ação</th>
                <th className="px-4 py-4 w-[38%]">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {eventos?.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-hover transition-colors"
                  >
                    <td className="px-4 py-4 text-text-muted font-mono truncate">
                      {formatDateTime(e.dataHora)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-hover border border-border flex items-center justify-center shrink-0">
                          <UserIcon
                            className="w-3 h-3 text-text-faint"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-text font-mono text-[11px] truncate">
                          {e.usuario}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-text-muted bg-hover border border-border px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider">
                        {e.entidade}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-text font-bold truncate">
                      {e.acao}
                    </td>
                    <td className="px-4 py-4 text-text-muted truncate">
                      {e.detalhes}
                    </td>
                  </tr>
                ))}
              {eventos?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-text-subtle italic"
                  >
                    Nenhum evento de auditoria registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border-subtle">
          {eventos?.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-subtle italic">
              Nenhum evento de auditoria registrado.
            </div>
          ) : (
            eventos?.map((e) => (
              <div key={e.id} className="p-4 space-y-3 hover:bg-hover transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-full bg-hover border border-border flex items-center justify-center shrink-0">
                      <UserIcon className="w-3.5 h-3.5 text-text-faint" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-text font-mono text-xs font-semibold truncate">{e.usuario}</p>
                      <p className="text-text-muted font-mono text-[10px] mt-0.5">{formatDateTime(e.dataHora)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-text-muted bg-hover border border-border px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-wider shrink-0">
                    {e.entidade}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Ação</span>
                    <p className="text-text font-mono font-bold mt-0.5">{e.acao}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Detalhes</span>
                    <p className="text-text-muted mt-0.5 text-xs">{e.detalhes}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
