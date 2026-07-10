import { z } from "zod";

export const itemSchema = z.object({
  id: z.string(),
  nome: z.string(),
  sku: z.string(),
  categoria: z.string(),
  precoUnitario: z.number(),
  unidadeMedida: z.string(),
  ativo: z.boolean(),
});

export type ItemResponse = z.infer<typeof itemSchema>;
