import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import type { OrdemVenda } from '../domain/types';
import { statusLabel } from '../domain/types';
import { usePermissao } from '../hooks/usePermission';

export function OVList() {
  const { data: ordens, loading } = useFetch<OrdemVenda[]>('/ordensVenda');
  const podeCriar = usePermissao('ov:criar');

  if (loading) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ordens de Venda</h1>
        {podeCriar && (
          <Link
            to="/ovs/nova"
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            Nova OV
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Número</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Transporte</th>
              <th className="p-3">Status</th>
              <th className="p-3">Valor Total</th>
              <th className="p-3">Previsão</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {ordens?.map((ov) => (
              <tr key={ov.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{ov.numero}</td>
                <td className="p-3">{ov.nomeCliente}</td>
                <td className="p-3">{ov.nomeTransporte}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-200">
                    {statusLabel(ov.status)}
                  </span>
                </td>
                <td className="p-3">R$ {ov.valorTotal.toFixed(2)}</td>
                <td className="p-3">{new Date(ov.dataEntregaPrevista).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">
                  <Link to={`/ovs/${ov.id}`} className="text-blue-600 hover:underline">
                    Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}