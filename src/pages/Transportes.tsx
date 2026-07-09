import { useFetch } from '../hooks/useFetch';
import type { TipoTransporte } from '../domain/types';

export function Transportes() {
  const { data: transportes, loading } = useFetch<TipoTransporte[]>('/tiposTransporte');

  if (loading) return <p role="status" aria-live="polite" className="text-gray-500">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transportes</h1>
      <div role="region" aria-label="Lista de tipos de transporte">
        <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Lista de tipos de transporte</caption>
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Modal</th>
              <th className="p-3">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {transportes?.map((t) => (
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{t.nome}</td>
                <td className="p-3 capitalize">{t.modal}</td>
                <td className="p-3">{t.ativo ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}