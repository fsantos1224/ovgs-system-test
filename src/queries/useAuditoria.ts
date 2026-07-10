import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet } from "./api";
import { auditoriaSchema } from "../schemas/auditoria";
import type { AuditoriaResponse } from "../schemas/auditoria";

const KEY = "auditoria";

export function useEventosAuditoria() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiGet<AuditoriaResponse[]>("/eventosAuditoria", z.array(auditoriaSchema)),
  });
}
