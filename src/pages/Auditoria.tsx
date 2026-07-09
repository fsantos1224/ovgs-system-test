import { useFetch } from '../hooks/useFetch';
import type { EventoAuditoria } from '../domain/types';

export function Auditoria() {
  const { data: eventos, loading } = useFetch<EventoAuditoria[]>('/eventosAuditoria');

  if (loading) return <p role="status" aria-live="polite" className="text-slate-500">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Auditoria</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Data/Hora</th>
              <th className="p-3">Usuário</th>
              <th className="p-3">Entidade</th>
              <th className="p-3">Ação</th>
              <th className="p-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {eventos?.map((e) => (
              <tr key={e.id} className="border-t hover:bg-slate-50">
                <td className="p-3">{new Date(e.dataHora).toLocaleString('pt-BR')}</td>
                <td className="p-3">{e.usuario}</td>
                <td className="p-3 text-slate-500">{e.entidade}</td>
                <td className="p-3">{e.acao}</td>
                <td className="p-3 text-slate-500 text-xs">{e.detalhes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
