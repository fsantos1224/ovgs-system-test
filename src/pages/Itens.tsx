import { useFetch } from '../hooks/useFetch';
import type { Item } from '../domain/types';

export function Itens() {
  const { data: itens, loading } = useFetch<Item[]>('/itens');

  if (loading) return <p role="status" aria-live="polite" className="text-gray-500">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Itens</h1>
      <div role="region" aria-label="Lista de itens">
        <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Lista de itens</caption>
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço Unitário</th>
              <th className="p-3">Unidade</th>
              <th className="p-3">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {itens?.map((item) => (
              <tr key={item.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{item.nome}</td>
                <td className="p-3">{item.sku}</td>
                <td className="p-3">{item.categoria}</td>
                <td className="p-3">R$ {item.precoUnitario.toFixed(2)}</td>
                <td className="p-3">{item.unidadeMedida}</td>
                <td className="p-3">{item.ativo ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}