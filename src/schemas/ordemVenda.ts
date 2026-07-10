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

export type OrdemVendaResponse = z.infer<typeof ordemVendaSchema>;
