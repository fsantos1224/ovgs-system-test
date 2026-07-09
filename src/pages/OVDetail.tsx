import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import type { OrdemVenda } from '../domain/types';
import { statusLabel, canTransition } from '../domain/types';
import { usePermissao } from '../hooks/usePermission';
import { apiPatch } from '../api/fetch';

export function OVDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: ov, loading, refresh } = useFetch<OrdemVenda>(id ? `/ordensVenda/${id}` : null);
  const podeAlterarStatus = usePermissao('ov:alterar_status');

  if (loading) return <p className="text-gray-500">Carregando...</p>;
  if (!ov) return <p className="text-red-500">Ordem de venda não encontrada.</p>;

  const transicoesPossiveis: OrdemVenda['status'][] = (['rascunho', 'pendente', 'confirmada', 'em_transporte', 'entregue', 'cancelada'] as const)
    .filter((s) => canTransition(ov.status, s));

  const handleStatusChange = async (novoStatus: OrdemVenda['status']) => {
    await apiPatch(`/ordensVenda/${ov.id}`, { status: novoStatus });
    refresh();
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/ordens-venda" className="text-blue-600 hover:underline text-sm">&larr; Voltar</Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">OV {ov.numero}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h2 className="font-semibold text-lg">Dados da Ordem</h2>
          <div className="text-sm space-y-1">
            <p><span className="text-slate-500">Cliente:</span> {ov.nomeCliente}</p>
            <p><span className="text-slate-500">Transporte:</span> {ov.nomeTransporte}</p>
            <p><span className="text-slate-500">Data de Emissão:</span> {new Date(ov.dataEmissao).toLocaleDateString('pt-BR')}</p>
            <p><span className="text-slate-500">Previsão de Entrega:</span> {new Date(ov.dataEntregaPrevista).toLocaleDateString('pt-BR')}</p>
            <p><span className="text-slate-500">Status:</span> <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-200">{statusLabel(ov.status)}</span></p>
            <p><span className="text-slate-500">Valor Total:</span> R$ {ov.valorTotal.toFixed(2)}</p>
            {ov.observacoes && <p><span className="text-slate-500">Observações:</span> {ov.observacoes}</p>}
          </div>

          {podeAlterarStatus && transicoesPossiveis.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm text-slate-500 mb-2">Alterar Status:</p>
              <div className="flex flex-wrap gap-2">
                {transicoesPossiveis.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="px-3 py-1 text-xs font-medium rounded bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                  >
                    {statusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">Itens</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Item</th>
                <th className="pb-2">Qtd</th>
                <th className="pb-2">Valor Unit.</th>
                <th className="pb-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ov.itens.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{item.nomeItem}</td>
                  <td className="py-2">{item.quantidade}</td>
                  <td className="py-2">R$ {item.precoUnitario.toFixed(2)}</td>
                  <td className="py-2">R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}