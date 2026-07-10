export type { OrdemVenda, OVStatus, ItemOV } from './entities/OrdemVenda';
export { STATUS_FLOW, canTransition, statusLabel } from './entities/OrdemVenda';

export type { Cliente } from './entities/Cliente';
export { canUseTransporte } from './entities/Cliente';

export type { Item } from './entities/Item';
export type { TipoTransporte } from './entities/TipoTransporte';
export type { EventoAuditoria } from './entities/EventoAuditoria';
export type { Usuario, UserRole } from './entities/Usuario';
