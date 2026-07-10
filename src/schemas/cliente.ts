import { z } from 'zod';

const clienteBaseSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  documento: z.string(),
  email: z.string().email('E-mail inválido').min(5).max(100),
  telefone: z.string(),
  endereco: z.string().max(200, 'Endereço muito longo').optional().default(''),
  ativo: z.boolean(),
});

export const clienteSchema = clienteBaseSchema.extend({
  id: z.string(),
  transportesAutorizados: z.array(z.string()),
});

export const clienteFormSchema = clienteBaseSchema.extend({
  documento: z.string().regex(/^[a-zA-Z0-9]{3,20}$/, 'Documento inválido'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (apenas números, 10-11 dígitos)'),
  transportesAutorizados: z.array(z.string()).optional().default([]),
});

export type ClienteResponse = z.infer<typeof clienteSchema>;
