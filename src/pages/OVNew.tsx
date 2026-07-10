// Formulário com React Hook Form + validação inline. React Hook Form justificado pela
// complexidade de itens dinâmicos. Validação manual (sem Zod/Yup) via funções puras.

import { useNavigate, Link } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useClientes, useTransportes, useItens, useCriarOV } from "../queries";
import type { ItemOV } from "../schemas";
import { canUseTransporte } from "../domain/types";
import { trackEvent } from "../lib/telemetry";
import { useMemo, useState } from "react";
import { ovSchema } from "../lib/validation";
import { newId } from "../lib/id";
import { useToast } from "../stores/toastStore";
import { Breadcrumbs } from "../components/Breadcrumbs";

type FormData = {
  clienteId: string;
  transporteId: string;
  dataEntregaPrevista: string;
  observacoes: string;
  itens: { itemId: string; quantidade: number }[];
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val / 100);
}

export function OVNew() {
  const navigate = useNavigate();
  const { data: clientes } = useClientes();
  const { data: transportes } = useTransportes();
  const { data: itens } = useItens();
  const criarOV = useCriarOV();
  const toast = useToast();
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

  const clienteSelecionado = useMemo(
    () => clientes?.find((c) => c.id === clienteSelecionadoId),
    [clientes, clienteSelecionadoId],
  );
  const transportesDisponiveis = useMemo(
    () => (transportes ?? []).filter((t) => canUseTransporte(clienteSelecionado, t.id)),
    [transportes, clienteSelecionado],
  );

  if (
    transporteSelecionadoId &&
    clienteSelecionado &&
    !canUseTransporte(clienteSelecionado, transporteSelecionadoId)
  ) {
    setValue("transporteId", "");
  }

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });

  const watchedItens = watch("itens");
  const valorEstimado = (watchedItens ?? []).reduce((acc, it) => {
    const item = itensMap.get(it.itemId);
    return acc + (item?.precoUnitario ?? 0) * (it.quantidade || 0);
  }, 0);

  const onSubmit = async (data: FormData) => {
    const itensValidos = data.itens.filter((i) => i.itemId).length;
    if (itensValidos === 0) {
      setError("itens", { type: "manual", message: "Adicione ao menos um item" });
      return;
    }
    clearErrors("itens");

    setSubmitting(true);
    setServerError("");
    const parsed = ovSchema.safeParse(data);
    if (!parsed.success) { setServerError(parsed.error.issues[0].message); setSubmitting(false); return; }
    const idempotencyKey = crypto.randomUUID();

    const itensOV: ItemOV[] = data.itens
      .filter((i) => i.itemId)
      .map((i) => {
        const item = itensMap.get(i.itemId);
        return {
          id: newId(),
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
      dataEntregaPrevista: new Date(data.dataEntregaPrevista).toISOString(),
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
      await criarOV.mutateAsync({ data: novaOV, headers: { "idempotency-key": idempotencyKey } });
      trackEvent("ov:criar", "ordem_venda", {
        numero: novaOV.numero,
        clienteId: data.clienteId,
      });
      toast.success(`OV ${novaOV.numero} criada com sucesso.`);
      navigate("/ovs");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro ao criar OV");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link to="/ovs" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-muted hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Voltar
        </Link>
      </div>

      {/* Editorial Header */}
      <div className="border-b border-border pb-6">
        <Breadcrumbs />
        <h1 className="text-4xl font-serif italic tracking-tight text-text mt-1">Nova Ordem de Venda</h1>
        <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">Cadastre uma nova ordem de venda no sistema.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 space-y-5 shadow-2xl">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block">Cliente <span className="text-amber-500">*</span></label>
            <select
              {...register("clienteId", { required: "Selecione um cliente" })}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="">Selecione um cliente...</option>
              {clientes?.filter((c) => c.ativo).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            {fieldErrors.clienteId && (
              <p role="alert" className="text-rose-400 text-xs mt-1">{fieldErrors.clienteId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block">Transporte <span className="text-amber-500">*</span></label>
            <select
              {...register("transporteId", { required: "Selecione um transporte" })}
              disabled={!clienteSelecionado}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">
                {!clienteSelecionado
                  ? "Selecione um cliente primeiro"
                  : transportesDisponiveis.length === 0
                    ? "Nenhum transporte autorizado"
                    : "Selecione..."}
              </option>
              {transportesDisponiveis.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
            {fieldErrors.transporteId && (
              <p role="alert" className="text-rose-400 text-xs mt-1">{fieldErrors.transporteId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block">Data de Entrega Prevista <span className="text-amber-500">*</span></label>
            <input
              type="date"
              {...register("dataEntregaPrevista", { required: "Informe a data de entrega" })}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
            />
            {fieldErrors.dataEntregaPrevista && (
              <p role="alert" className="text-rose-400 text-xs mt-1">{fieldErrors.dataEntregaPrevista.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block">Observações</label>
            <textarea
              {...register("observacoes")}
              rows={3}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
            />
          </div>
        </div>

        {/* Items section */}
        <div className="border border-dashed border-border-strong rounded-xl p-5 bg-canvas space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Itens do Pedido</h3>
            <button
              type="button"
              onClick={() => append({ itemId: "", quantidade: 1 })}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-border-strong hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-3 py-1.5 rounded-md transition-all focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Adicionar Item
            </button>
          </div>

          <div className="bg-surface rounded-lg border border-border divide-y divide-border-subtle overflow-hidden">
            {fields.map((field, i) => (
              <div key={field.id} className="px-4 py-3 flex gap-3 items-center text-xs">
                <select
                  {...register(`itens.${i}.itemId`)}
                  className="flex-1 bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
                >
                  <option value="">Selecione um item...</option>
                  {itens?.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.nome} — {formatCurrency(it.precoUnitario)}
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
                  className="w-20 bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden font-mono"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remover item ${i + 1}`}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 p-1.5 rounded-md transition-all focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-faint">Valor Estimado:</span>
            <span className="text-xl font-bold font-mono text-accent">{formatCurrency(valorEstimado)}</span>
          </div>

          {fieldErrors.itens && (
            <p role="alert" className="text-rose-400 text-xs">{fieldErrors.itens.message}</p>
          )}
        </div>

        {serverError && (
          <div role="alert" className="bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-semibold p-4 rounded-lg">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/ovs"
            className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-surface-elevated hover:bg-accent text-text hover:text-on-accent font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-border-strong focus-visible:outline-2 focus-visible:outline-accent"
          >
            {submitting ? "Criando..." : "Criar Ordem"}
          </button>
        </div>
      </form>
    </div>
  );
}