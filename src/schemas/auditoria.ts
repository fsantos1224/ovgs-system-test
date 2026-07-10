import { z } from 'zod';

export const auditoriaSchema = z.object({
  id: z.string(),
  entidade: z.string(),
  entidadeId: z.string(),
  acao: z.string(),
  usuario: z.string(),
  dataHora: z.string(),
  detalhes: z.string(),
  estadoAnterior: z.string().nullish(),
  estadoPosterior: z.string().nullish(),
});

export type AuditoriaResponse = z.infer<typeof auditoriaSchema>;
