import { useFetch } from '../hooks/useFetch';
import type { OrdemVenda } from '../domain/types';
import { statusLabel } from '../domain/types';

export function Agendamento() {
  const { data: ordens, loading } = useFetch<OrdemVenda[]>('/ordensVenda');

  if (loading) return <p className="text-gray-500">Carregando...</p>;

  const paraAgendar = ordens?.filter((ov) => ov.status === 'CRIADA' || ov.status === 'PLANEJADA');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Agendamento de Entregas</h1>
      <p className="text-sm text-slate-500 mb-4">Ordens com status CRIADA ou PLANEJADA aguardando agendamento de transporte.</p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Número</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Status</th>
              <th className="p-3">Previsão de Entrega</th>
              <th className="p-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {paraAgendar?.map((ov) => (
              <tr key={ov.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{ov.numero}</td>
                <td className="p-3">{ov.nomeCliente}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-200">
                    {statusLabel(ov.status)}
                  </span>
                </td>
                <td className="p-3">{new Date(ov.dataEntregaPrevista).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">R$ {ov.valorTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}