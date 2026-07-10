import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet, apiGetPaginated, apiPost, apiPatch, apiDelete } from "./api";
import { ordemVendaSchema } from "../schemas/ordemVenda";
import type { OrdemVendaResponse } from "../schemas/ordemVenda";
import { useToast } from "../stores/toastStore";

const KEY = "ordensVenda";

export function useOrdensVenda(params: { page: number; pageSize: number; filters?: Record<string, string | undefined>; sort?: string; order?: string }) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        _page: String(params.page),
        _limit: String(params.pageSize),
      });
      for (const [k, v] of Object.entries(params.filters ?? {})) {
        if (v) searchParams.set(k, v);
      }
      if (params.sort) searchParams.set("_sort", params.sort);
      if (params.order) searchParams.set("_order", params.order);
      return apiGetPaginated(`/ordensVenda?${searchParams}`, z.array(ordemVendaSchema));
    },
    placeholderData: keepPreviousData,
  });
}

export function useOrdemVenda(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => apiGet<OrdemVendaResponse>(`/ordensVenda/${id}`, ordemVendaSchema),
    enabled: !!id,
  });
}

export function useCriarOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ data, headers }: { data: Record<string, unknown>; headers?: Record<string, string> }) =>
      apiPost("/ordensVenda", data, ordemVendaSchema, headers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("OV criada.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao criar OV."),
  });
}

export function useAtualizarOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiPatch(`/ordensVenda/${id}`, data, ordemVendaSchema),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("OV atualizada.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao atualizar OV."),
  });
}

export function useExcluirOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/ordensVenda/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("OV excluída.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao excluir OV."),
  });
}

export function useAlterarStatusOV() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string } }) => apiPatch(`/ordensVenda/${id}`, data, ordemVendaSchema),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("OV status alterado.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao alterar status da OV."),
  });
}
