import { useFetch } from '../hooks/useFetch';
import type { Cliente } from '../domain/types';

export function Clientes() {
  const { data: clientes, loading } = useFetch<Cliente[]>('/clientes');

  if (loading) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Documento</th>
              <th className="p-3">Email</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{c.nome}</td>
                <td className="p-3">{c.documento}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.telefone}</td>
                <td className="p-3">{c.ativo ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}