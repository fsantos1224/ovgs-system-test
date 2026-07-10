import type { ClienteResponse } from "../schemas/cliente";
import type { TransporteResponse } from "../schemas/transporte";
import type { ItemResponse } from "../schemas/item";
import type { OrdemVendaResponse } from "../schemas/ordemVenda";
import type { AuditoriaResponse } from "../schemas/auditoria";

export interface Usuario {
  email: string;
  senha: string;
  role: "viewer" | "operator" | "manager" | "admin";
  nome: string;
}

export type OVStatus = (typeof STATUS_FLOW)[number];

export const STATUS_FLOW = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
] as const;

export function canTransition(from: OVStatus, to: OVStatus): boolean {
  const i = STATUS_FLOW.indexOf(from);
  return i >= 0 && STATUS_FLOW[i + 1] === to;
}

export function statusLabel(status: OVStatus): string {
  const labels: Record<OVStatus, string> = {
    CRIADA: "Criada",
    PLANEJADA: "Planejada",
    AGENDADA: "Agendada",
    EM_TRANSPORTE: "Em Transporte",
    ENTREGUE: "Entregue",
  };
  return labels[status];
}

export type Cliente = ClienteResponse;

export function canUseTransporte(
  cliente: Pick<Cliente, "transportesAutorizados"> | null | undefined,
  transporteId: string,
): boolean {
  if (!cliente) return false;
  return cliente.transportesAutorizados?.includes(transporteId) ?? false;
}

export type TipoTransporte = TransporteResponse;
export type Item = ItemResponse;
export type OrdemVenda = OrdemVendaResponse;
export type EventoAuditoria = AuditoriaResponse;

export interface UserRole {
  role: "admin" | "manager" | "operator" | "viewer";
  nome: string;
}
