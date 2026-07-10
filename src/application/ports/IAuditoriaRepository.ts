import type { EventoAuditoria } from '../../domain/entities/EventoAuditoria';

export interface IAuditoriaRepository {
  listar(): Promise<EventoAuditoria[]>;
}
