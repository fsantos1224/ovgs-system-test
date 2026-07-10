import { useQuery } from '@tanstack/react-query';
import { AuditoriaRepository } from '../infrastructure/repositories/AuditoriaRepository';
import type { IAuditoriaRepository } from '../application/ports/IAuditoriaRepository';

const KEY = 'auditoria';

const repo: IAuditoriaRepository = new AuditoriaRepository();

export function useAuditoria() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => repo.listar(),
  });
}

export const useEventosAuditoria = useAuditoria;
