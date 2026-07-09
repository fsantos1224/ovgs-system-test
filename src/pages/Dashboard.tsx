import { useFetch } from '../hooks/useFetch';
import type { OrdemVenda } from '../domain/types';
import { statusLabel } from '../domain/types';

export function Dashboard() {
  const { data: ordens, loading } = useFetch<OrdemVenda[]>('/ordensVenda');

  if (loading) return <p className="text-gray-500">Carregando...</p>;

  const porStatus = ordens?.reduce<Record<string, number>>((acc, ov) => {
    const label = statusLabel(ov.status);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Object.entries(porStatus ?? {}).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-slate-700">{count}</div>
            <div className="text-sm text-slate-500">{status}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Últimas Ordens de Venda</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Número</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Status</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {ordens?.slice(0, 5).map((ov) => (
              <tr key={ov.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{ov.numero}</td>
                <td className="p-3">{ov.nomeCliente}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-200">
                    {statusLabel(ov.status)}
                  </span>
                </td>
                <td className="p-3">R$ {ov.valorTotal.toFixed(2)}</td>
                <td className="p-3">{new Date(ov.dataEmissao).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}