// 🐴 Formulário minimalista sem validação avançada. Apenas cria OV no rascunho.

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { apiPost } from '../api/fetch';
import type { Cliente, Item, TipoTransporte, ItemOV } from '../domain/types';

export function OVNew() {
  const navigate = useNavigate();
  const { data: clientes } = useFetch<Cliente[]>('/clientes');
  const { data: transportes } = useFetch<TipoTransporte[]>('/tiposTransporte');
  const { data: itens } = useFetch<Item[]>('/itens');

  const [clienteId, setClienteId] = useState('');
  const [transporteId, setTransporteId] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState<{ itemId: string; quantidade: number }[]>([]);

  const clientesMap = new Map(clientes?.map((c) => [c.id, c]));
  const transportesMap = new Map(transportes?.map((t) => [t.id, t]));
  const itensMap = new Map(itens?.map((i) => [i.id, i]));

  const adicionarItem = () => {
    setItensSelecionados([...itensSelecionados, { itemId: '', quantidade: 1 }]);
  };

  const atualizarItem = (index: number, campo: 'itemId' | 'quantidade', valor: string | number) => {
    const novos = [...itensSelecionados];
    (novos[index] as Record<string, string | number>)[campo] = valor;
    setItensSelecionados(novos);
  };

  const removerItem = (index: number) => {
    setItensSelecionados(itensSelecionados.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const cliente = clientesMap.get(clienteId);
    const transporte = transportesMap.get(transporteId);

    if (!cliente || !transporte) return;

    const itensOV: ItemOV[] = itensSelecionados.map((s) => {
      const item = itensMap.get(s.itemId);
      return {
        itemId: s.itemId,
        nomeItem: item?.nome ?? '',
        quantidade: s.quantidade,
        precoUnitario: item?.precoUnitario ?? 0,
      };
    });

    const valorTotal = itensOV.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0);

    const novaOV = {
      numero: `OV-${Date.now()}`,
      clienteId,
      nomeCliente: cliente.nome,
      dataEmissao: new Date().toISOString(),
      dataEntregaPrevista: new Date(dataEntrega).toISOString(),
      transporteId,
      nomeTransporte: transporte.nome,
      status: 'rascunho',
      itens: itensOV,
      valorTotal,
      observacoes: observacoes || undefined,
    };

    await apiPost('/ordensVenda', novaOV);
    navigate('/ordens-venda');
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/ordens-venda" className="text-blue-600 hover:underline text-sm">&larr; Voltar</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Nova Ordem de Venda</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {clientes?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Transporte</label>
          <select value={transporteId} onChange={(e) => setTransporteId(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {transportes?.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data de Entrega Prevista</label>
          <input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Itens</h2>
            <button type="button" onClick={adicionarItem} className="text-sm text-blue-600 hover:underline">+ Adicionar Item</button>
          </div>
          {itensSelecionados.map((item, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
              <select
                value={item.itemId}
                onChange={(e) => atualizarItem(i, 'itemId', e.target.value)}
                required
                className="flex-1 border rounded px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {itens?.map((it) => <option key={it.id} value={it.id}>{it.nome} — R$ {it.precoUnitario.toFixed(2)}</option>)}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantidade}
                onChange={(e) => atualizarItem(i, 'quantidade', Number(e.target.value))}
                required
                className="w-20 border rounded px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removerItem(i)} className="text-red-500 text-sm">Remover</button>
            </div>
          ))}
        </div>

        <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition-colors">
          Criar OV (Rascunho)
        </button>
      </form>
    </div>
  );
}