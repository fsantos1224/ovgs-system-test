import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet, apiGetPaginated, apiPost, apiPatch, apiDelete } from "./api";
import { ordemVendaSchema } from "../schemas/ordemVenda";
import type { OrdemVendaResponse } from "../schemas/ordemVenda";

const KEY = "ordensVenda";

export function useOrdensVenda(params: { page: number; pageSize: number; filters?: Record<string, string | undefined> }) {
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
  return useMutation({
    mutationFn: ({ data, headers }: { data: Record<string, unknown>; headers?: Record<string, string> }) =>
      apiPost("/ordensVenda", data, headers),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAtualizarOV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiPatch(`/ordensVenda/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useExcluirOV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/ordensVenda/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAlterarStatusOV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string } }) => apiPatch(`/ordensVenda/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
