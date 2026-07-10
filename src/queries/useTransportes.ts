import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet, apiPost, apiPatch, apiDelete } from "./api";
import { transporteSchema } from "../schemas/transporte";
import type { TransporteResponse } from "../schemas/transporte";

const KEY = "transportes";

export function useTransportes() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiGet<TransporteResponse[]>("/tiposTransporte", z.array(transporteSchema)),
  });
}

export function useCriarTransporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost("/tiposTransporte", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAtualizarTransporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiPatch(`/tiposTransporte/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useExcluirTransporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/tiposTransporte/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
