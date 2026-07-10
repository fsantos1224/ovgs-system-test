import { z } from "zod";

const statusFlow = z.enum([
  "CRIADA", "PLANEJADA", "AGENDADA", "EM_TRANSPORTE", "ENTREGUE",
]);

const itemOVSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  nomeItem: z.string(),
  quantidade: z.number(),
  precoUnitario: z.number(),
});

export const ordemVendaSchema = z.object({
  id: z.string(),
  numero: z.string(),
  clienteId: z.string(),
  nomeCliente: z.string(),
  dataEmissao: z.string(),
  dataEntregaPrevista: z.string(),
  transporteId: z.string(),
  nomeTransporte: z.string(),
  status: statusFlow,
  itens: z.array(itemOVSchema),
  valorTotal: z.number(),
  observacoes: z.string().nullish(),
  janelaAtendimento: z.string().nullish(),
});

export const ovFormSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  transporteId: z.string().min(1, "Selecione um transporte"),
  dataEntregaPrevista: z.string().min(1, "Informe a data de entrega").regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  observacoes: z.string().max(500, "Observações muito longas").optional().default(""),
  itens: z.array(z.object({
    itemId: z.string().min(1, "Selecione um item"),
    quantidade: z.number().int().positive("Quantidade deve ser positiva"),
  })).min(1, "Adicione ao menos um item"),
});

export type ItemOV = z.infer<typeof itemOVSchema>;
export type OrdemVendaResponse = z.infer<typeof ordemVendaSchema>;
