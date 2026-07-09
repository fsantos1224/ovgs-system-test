// 🐴 Formulário com React Hook Form + validação inline. React Hook Form justificado pela
// complexidade de itens dinâmicos. Validação manual (sem Zod/Yup) via funções puras.

import { useNavigate, Link } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { useFetch } from '../hooks/useFetch';
import { apiPost } from '../api/fetch';
import type { Cliente, Item, TipoTransporte, ItemOV } from '../domain/types';
import { trackEvent } from '../lib/telemetry';
import { useState } from 'react';

type FormData = {
  clienteId: string;
  transporteId: string;
  dataEntrega: string;
  observacoes: string;
  itens: { itemId: string; quantidade: number }[];
};

// 🐴 Validação manual — função pura, sem Zod/Yup
type ValidationErrors = Record<string, string>;
const validate = (data: FormData, itensDisponiveis: number): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!data.clienteId) errors.clienteId = 'Selecione um cliente';
  if (!data.transporteId) errors.transporteId = 'Selecione um transporte';
  if (!data.dataEntrega) errors.dataEntrega = 'Informe a data de entrega';
  if (itensDisponiveis === 0) errors.itens = 'Adicione ao menos um item';
  return errors;
};

export function OVNew() {
  const navigate = useNavigate();
  const { data: clientes } = useFetch<Cliente[]>('/clientes');
  const { data: transportes } = useFetch<TipoTransporte[]>('/tiposTransporte');
  const { data: itens } = useFetch<Item[]>('/itens');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const itensMap = new Map(itens?.map((i) => [i.id, i]));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors: fieldErrors },
  } = useForm<FormData>({ defaultValues: { itens: [{ itemId: '', quantidade: 1 }] } });

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });

  const onSubmit = async (data: FormData) => {
    const manualErrors = validate(data, fields.filter(f => f.itemId).length);
    if (Object.keys(manualErrors).length > 0) return;

    setSubmitting(true);
    setServerError('');
    const idempotencyKey = crypto.randomUUID();

    const itensOV: ItemOV[] = data.itens
      .filter((i) => i.itemId)
      .map((i) => {
        const item = itensMap.get(i.itemId);
        return {
          itemId: i.itemId,
          nomeItem: item?.nome ?? '',
          quantidade: i.quantidade,
          precoUnitario: item?.precoUnitario ?? 0,
        };
      });

    const cliente = clientes?.find((c) => c.id === data.clienteId);
    const transporte = transportes?.find((t) => t.id === data.transporteId);

    const novaOV = {
      numero: `OV-${Date.now()}`,
      clienteId: data.clienteId,
      nomeCliente: cliente?.nome ?? '',
      dataEmissao: new Date().toISOString(),
      dataEntregaPrevista: new Date(data.dataEntrega).toISOString(),
      transporteId: data.transporteId,
      nomeTransporte: transporte?.nome ?? '',
      status: 'CRIADA',
      itens: itensOV,
      valorTotal: itensOV.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0),
      observacoes: data.observacoes || undefined,
    };

    try {
      await apiPost('/ordensVenda', novaOV, { 'idempotency-key': idempotencyKey });
      trackEvent('ov:criar', 'ordem_venda', { numero: novaOV.numero, clienteId: data.clienteId });
      navigate('/ovs');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao criar OV');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/ovs" className="text-blue-600 hover:underline text-sm">&larr; Voltar</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Nova Ordem de Venda</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select {...register('clienteId', { required: true })} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {clientes?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {fieldErrors.clienteId && <p className="text-red-500 text-xs mt-1">{fieldErrors.clienteId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Transporte</label>
          <select {...register('transporteId', { required: true })} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {transportes?.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          {fieldErrors.transporteId && <p className="text-red-500 text-xs mt-1">{fieldErrors.transporteId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data de Entrega Prevista</label>
          <input type="date" {...register('dataEntrega', { required: true })} className="w-full border rounded px-3 py-2 text-sm" />
          {fieldErrors.dataEntrega && <p className="text-red-500 text-xs mt-1">{fieldErrors.dataEntrega.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea {...register('observacoes')} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Itens</h2>
            <button type="button" onClick={() => append({ itemId: '', quantidade: 1 })} className="text-sm text-blue-600 hover:underline">
              + Adicionar Item
            </button>
          </div>
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-center mb-2">
              <select {...register(`itens.${i}.itemId`)} className="flex-1 border rounded px-3 py-2 text-sm">
                <option value="">Selecione...</option>
                {itens?.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.nome} — R$ {it.precoUnitario.toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                {...register(`itens.${i}.quantidade`, { valueAsNumber: true, min: 1 })}
                className="w-20 border rounded px-3 py-2 text-sm"
              />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-red-500 text-sm">Remover</button>
              )}
            </div>
          ))}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Criando...' : 'Criar OV'}
        </button>
      </form>
    </div>
  );
}