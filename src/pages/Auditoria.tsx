import { useState } from 'react';
import { User as UserIcon, ShieldCheck, Eye } from 'lucide-react';
import { useEventosAuditoria } from '../queries';
import { usePermissao } from '../hooks/usePermission';
import { Modal } from '../components/Modal';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { AuditoriaResponse } from '../schemas/auditoria';

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('pt-BR');
}

const acaoLabels: Record<string, string> = {
  criacao: 'Criação',
  alteracao_status: 'Alteração de Status',
  alteracao_agendamento: 'Alteração de Agendamento',
  alteracao_transporte: 'Alteração de Transporte',
  alteracao: 'Alteração',
  exclusao: 'Exclusão',
};

function formatEstado(raw: string | null | undefined): string {
  if (!raw) return '—';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function estadoEntidade(evento: AuditoriaResponse): React.ReactNode {
  if (!evento.estadoAnterior && !evento.estadoPosterior) return null;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
          Estado Anterior
        </span>
        <pre className="text-text-muted text-[10px] font-mono whitespace-pre-wrap bg-hover rounded-lg p-3 border border-border max-h-48 overflow-y-auto">
          {formatEstado(evento.estadoAnterior)}
        </pre>
      </div>
      <div>
        <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
          Estado Posterior
        </span>
        <pre className="text-text-muted text-[10px] font-mono whitespace-pre-wrap bg-hover rounded-lg p-3 border border-border max-h-48 overflow-y-auto">
          {formatEstado(evento.estadoPosterior)}
        </pre>
      </div>
    </div>
  );
}

export function Auditoria() {
  const podeVer = usePermissao('auditoria:ver');
  const { data: eventos, isLoading } = useEventosAuditoria();
  const [consultando, setConsultando] = useState<AuditoriaResponse | null>(null);

  if (!podeVer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="border-b border-border pb-6">
          <Breadcrumbs />
          <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">Auditoria</h1>
        </div>
        <div role="alert" className="bg-surface rounded-xl border border-border p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-bold text-text">Acesso negado</h2>
          </div>
          <p className="text-text-muted text-sm">Você não tem permissão para visualizar a auditoria do sistema.</p>
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
        <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">Auditoria</h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
          Histórico de ações e transações efetuadas no sistema.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <caption className="sr-only">Eventos de auditoria do sistema</caption>
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-4 py-4 w-[16%]">Data/Hora</th>
                <th className="px-4 py-4 w-[20%]">Usuário</th>
                <th className="px-4 py-4 w-[10%]">Entidade</th>
                <th className="px-4 py-4 w-[10%]">Ação</th>
                <th className="px-4 py-4 w-[34%]">Detalhes</th>
                <th className="px-4 py-4 w-[10%] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {eventos?.map((e) => (
                <tr key={e.id} className="hover:bg-hover transition-colors">
                  <td className="px-4 py-4 text-text-muted font-mono truncate">{formatDateTime(e.dataHora)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-hover border border-border flex items-center justify-center shrink-0">
                        <UserIcon className="w-3 h-3 text-text-faint" aria-hidden="true" />
                      </div>
                      <span className="text-text font-mono text-[11px] truncate">{e.usuario}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-text-muted bg-hover border border-border px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider">
                      {e.entidade}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-[11px] text-text font-bold truncate">{e.acao}</td>
                  <td className="px-4 py-4 text-text-muted truncate">{e.detalhes}</td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setConsultando(e)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                      title="Detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {eventos?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-subtle italic">
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
            <div className="px-6 py-12 text-center text-text-subtle italic">Nenhum evento de auditoria registrado.</div>
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
                <div className="flex justify-end pt-2 border-t border-border-subtle">
                  <button
                    onClick={() => setConsultando(e)}
                    className="inline-flex items-center gap-1.5 min-w-[44px] h-11 px-3 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors text-xs font-bold focus-visible:outline-2 focus-visible:outline-accent"
                    title="Detalhes"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={!!consultando} title="Detalhes do Evento" onClose={() => setConsultando(null)}>
        {consultando && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Data/Hora
                </span>
                <p className="text-text font-mono font-medium">{formatDateTime(consultando.dataHora)}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Usuário
                </span>
                <p className="text-text font-mono font-medium">{consultando.usuario}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Entidade
                </span>
                <span className="inline-block font-bold text-text-muted bg-hover border border-border px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider">
                  {consultando.entidade}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  ID da Entidade
                </span>
                <p className="text-text font-mono font-medium">{consultando.entidadeId}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">Ação</span>
                <p className="text-text font-bold">{acaoLabels[consultando.acao] || consultando.acao}</p>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                Detalhes
              </span>
              <p className="text-text-muted bg-hover rounded-lg p-3 border border-border">{consultando.detalhes}</p>
            </div>
            {estadoEntidade(consultando)}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setConsultando(null)}
                className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
