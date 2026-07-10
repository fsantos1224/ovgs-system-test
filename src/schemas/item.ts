import { z } from 'zod';

const itemBaseSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  sku: z.string().min(2, 'SKU deve ter no mínimo 2 caracteres').max(50, 'SKU muito longo'),
  categoria: z.string().min(2, 'Categoria deve ter no mínimo 2 caracteres').max(50, 'Categoria muito longa'),
  precoUnitario: z.number().positive('Preço deve ser positivo'),
  unidadeMedida: z.string().min(1, 'Selecione uma unidade'),
  ativo: z.boolean(),
});

export const itemSchema = itemBaseSchema.extend({
  id: z.string(),
});

export const itemFormSchema = itemBaseSchema.extend({
  precoUnitario: z
    .number()
    .positive()
    .transform((v) => Math.round(v * 100)),
});

export type ItemResponse = z.infer<typeof itemSchema>;
