import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  documento: z.string().regex(/^\d{11,14}$/, "Documento inválido (apenas números, 11-14 dígitos)"),
  email: z.string().email("E-mail inválido").min(5).max(100),
  telefone: z.string().regex(/^\d{10,11}$/, "Telefone inválido (apenas números, 10-11 dígitos)"),
  endereco: z.string().max(200, "Endereço muito longo").optional().default(""),
  ativo: z.boolean(),
});

export const transporteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  modal: z.string().min(2, "Selecione um modal válido"),
  ativo: z.boolean(),
});

export const itemSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  sku: z.string().min(2, "SKU deve ter no mínimo 2 caracteres").max(50, "SKU muito longo"),
  categoria: z.string().min(2, "Categoria deve ter no mínimo 2 caracteres").max(50, "Categoria muito longa"),
  precoUnitario: z.number().positive("Preço deve ser positivo").transform(v => Math.round(v * 100)),
  unidadeMedida: z.string().min(1, "Selecione uma unidade"),
  ativo: z.boolean(),
});

export const ovSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  transporteId: z.string().min(1, "Selecione um transporte"),
  dataEntrega: z.string().min(1, "Informe a data de entrega").regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  observacoes: z.string().max(500, "Observações muito longas").optional().default(""),
  itens: z.array(z.object({
    itemId: z.string().min(1, "Selecione um item"),
    quantidade: z.number().int().positive("Quantidade deve ser positiva"),
  })).min(1, "Adicione ao menos um item"),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
export type TransporteInput = z.infer<typeof transporteSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type OVInput = z.infer<typeof ovSchema>;