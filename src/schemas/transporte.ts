import { z } from 'zod';

export const modalEnum = z.enum(['rodoviario', 'aereo', 'maritimo', 'ferroviario']);

const transporteBaseSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  modal: modalEnum,
  ativo: z.boolean(),
});

export const transporteSchema = transporteBaseSchema.extend({
  id: z.string(),
});

export const transporteFormSchema = transporteBaseSchema;

export type TransporteResponse = z.infer<typeof transporteSchema>;
