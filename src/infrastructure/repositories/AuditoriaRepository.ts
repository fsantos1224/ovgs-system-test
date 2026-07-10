import { z } from 'zod';
import { apiGet } from '../../queries/api';
import { auditoriaSchema } from '../../schemas/auditoria';
import type { IAuditoriaRepository } from '../../application/ports/IAuditoriaRepository';
import type { EventoAuditoria } from '../../domain/entities/EventoAuditoria';

export class AuditoriaRepository implements IAuditoriaRepository {
  async listar(): Promise<EventoAuditoria[]> {
    return apiGet('/eventosAuditoria', z.array(auditoriaSchema));
  }
}
