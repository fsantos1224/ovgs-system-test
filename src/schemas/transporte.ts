import { z } from "zod";

const modalEnum = z.enum(["rodoviario", "aereo", "maritimo", "ferroviario"]);

export const transporteSchema = z.object({
  id: z.string(),
  nome: z.string(),
  modal: modalEnum,
  ativo: z.boolean(),
});

export type TransporteResponse = z.infer<typeof transporteSchema>;
