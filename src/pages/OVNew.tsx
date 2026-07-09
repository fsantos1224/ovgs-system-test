// Formulário com React Hook Form + validação inline. React Hook Form justificado pela
// complexidade de itens dinâmicos. Validação manual (sem Zod/Yup) via funções puras.

import { useNavigate, Link } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { useFetch } from "../hooks/useFetch";
import { apiPost } from "../api/fetch";
import type { Cliente, Item, TipoTransporte, ItemOV } from "../domain/types";
import { canUseTransporte } from "../domain/types";
import { trackEvent } from "../lib/telemetry";
import { useMemo, useState } from "react";

type FormData = {
  clienteId: string;
  transporteId: string;
  dataEntrega: string;
  observacoes: string;
  itens: { itemId: string; quantidade: number }[];
};

// Validação por campo via React Hook Form (required messages + min).
// Validação cross-field (itens vazios) feita em onSubmit usando `data` (fonte
// da verdade do submit), não `fields` do useFieldArray — `fields` pode conter
// defaults stale após edição.

export function OVNew() {
  const navigate = useNavigate();
  const { data: clientes } = useFetch<Cliente[]>("/clientes");
  const { data: transportes } = useFetch<TipoTransporte[]>("/tiposTransporte");
  const { data: itens } = useFetch<Item[]>("/itens");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const itensMap = new Map(itens?.map((i) => [i.id, i]));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    setValue,
    formState: { errors: fieldErrors },
  } = useForm<FormData>({
    defaultValues: { itens: [{ itemId: "", quantidade: 1 }] },
  });

  const clienteSelecionadoId = watch("clienteId");
  const transporteSelecionadoId = watch("transporteId");

  // Dropdown dependente: ao escolher cliente, filtra transportes pelos autorizados.
  const clienteSelecionado = useMemo(
    () => clientes?.find((c) => c.id === clienteSelecionadoId),
    [clientes, clienteSelecionadoId],
  );
  const transportesDisponiveis = useMemo(
    () => (transportes ?? []).filter((t) => canUseTransporte(clienteSelecionado, t.id)),
    [transportes, clienteSelecionado],
  );

  // Se trocar de cliente e o transporte previamente escolhido não é mais
  // autorizado, limpa o campo para evitar submit inválido.
  if (
    transporteSelecionadoId &&
    clienteSelecionado &&
    !canUseTransporte(clienteSelecionado, transporteSelecionadoId)
  ) {
    setValue("transporteId", "");
  }

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });

  const onSubmit = async (data: FormData) => {
    // Cross-field: ao menos um item com itemId selecionado.
    // Usa `data` (o que o usuário digitou), não `fields` (registro do RHF, que
    // pode conter defaults stale).
    const itensValidos = data.itens.filter((i) => i.itemId).length;
    if (itensValidos === 0) {
      setError("itens", { type: "manual", message: "Adicione ao menos um item" });
      return;
    }
    clearErrors("itens");

    setSubmitting(true);
    setServerError("");
    const idempotencyKey = crypto.randomUUID();

    const itensOV: ItemOV[] = data.itens
      .filter((i) => i.itemId)
      .map((i) => {
        const item = itensMap.get(i.itemId);
        return {
          itemId: i.itemId,
          nomeItem: item?.nome ?? "",
          quantidade: i.quantidade,
          precoUnitario: item?.precoUnitario ?? 0,
        };
      });

    const cliente = clientes?.find((c) => c.id === data.clienteId);
    const transporte = transportes?.find((t) => t.id === data.transporteId);

    const novaOV = {
      numero: `OV-${Date.now()}`,
      clienteId: data.clienteId,
      nomeCliente: cliente?.nome ?? "",
      dataEmissao: new Date().toISOString(),
      dataEntregaPrevista: new Date(data.dataEntrega).toISOString(),
      transporteId: data.transporteId,
      nomeTransporte: transporte?.nome ?? "",
      status: "CRIADA",
      itens: itensOV,
      valorTotal: itensOV.reduce(
        (acc, i) => acc + i.quantidade * i.precoUnitario,
        0,
      ),
      observacoes: data.observacoes || undefined,
    };

    try {
      await apiPost("/ordensVenda", novaOV, {
        "idempotency-key": idempotencyKey,
      });
      trackEvent("ov:criar", "ordem_venda", {
        numero: novaOV.numero,
        clienteId: data.clienteId,
      });
      navigate("/ovs");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro ao criar OV");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/ovs" className="text-blue-600 hover:underline text-sm">
          &larr; Voltar
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Nova Ordem de Venda</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            {...register("clienteId", { required: "Selecione um cliente" })}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {clientes?.filter((c) => c.ativo).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {fieldErrors.clienteId && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.clienteId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Transporte</label>
          <select
            {...register("transporteId", { required: "Selecione um transporte" })}
            disabled={!clienteSelecionado}
            className="w-full border rounded px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="">
              {!clienteSelecionado
                ? "Selecione um cliente primeiro"
                : transportesDisponiveis.length === 0
                  ? "Nenhum transporte autorizado"
                  : "Selecione..."}
            </option>
            {transportesDisponiveis.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          {fieldErrors.transporteId && (
            <p role="alert" className="text-red-500 text-xs mt-1">
              {fieldErrors.transporteId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Data de Entrega Prevista
          </label>
          <input
            type="date"
            {...register("dataEntrega", { required: "Informe a data de entrega" })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {fieldErrors.dataEntrega && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.dataEntrega.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            {...register("observacoes")}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Itens</h2>
            <button
              type="button"
              onClick={() => append({ itemId: "", quantidade: 1 })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Adicionar Item
            </button>
          </div>
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-center mb-2">
              <select
                {...register(`itens.${i}.itemId`)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              >
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
                {...register(`itens.${i}.quantidade`, {
                  valueAsNumber: true,
                  min: { value: 1, message: "Mínimo 1" },
                })}
                className="w-20 border rounded px-3 py-2 text-sm"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-red-500 text-sm"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          {fieldErrors.itens && (
            <p role="alert" className="text-red-500 text-xs mt-1">
              {fieldErrors.itens.message}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="text-red-500 text-sm">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Criando..." : "Criar OV"}
        </button>
      </form>
    </div>
  );
}
