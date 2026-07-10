import { z } from "zod";

export const clienteSchema = z.object({
  id: z.string(),
  nome: z.string(),
  documento: z.string(),
  email: z.string(),
  telefone: z.string(),
  endereco: z.string(),
  ativo: z.boolean(),
  transportesAutorizados: z.array(z.string()),
});

export type ClienteResponse = z.infer<typeof clienteSchema>;
