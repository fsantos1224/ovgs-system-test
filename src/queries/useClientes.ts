import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet, apiPost, apiPatch, apiDelete } from "./api";
import { clienteSchema } from "../schemas/cliente";
import type { ClienteResponse } from "../schemas/cliente";

const KEY = "clientes";

export function useClientes() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiGet<ClienteResponse[]>("/clientes", z.array(clienteSchema)),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => apiGet<ClienteResponse>(`/clientes/${id}`, clienteSchema),
    enabled: !!id,
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost("/clientes", data, clienteSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAtualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiPatch(`/clientes/${id}`, data, clienteSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useExcluirCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/clientes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
