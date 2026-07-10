import { z } from "zod";
import { clienteFormSchema, transporteFormSchema, itemFormSchema, ovFormSchema } from "../schemas";

export const clienteSchema = clienteFormSchema;
export const transporteSchema = transporteFormSchema;
export const itemSchema = itemFormSchema;
export const ovSchema = ovFormSchema;

export type ClienteInput = z.infer<typeof clienteFormSchema>;
export type TransporteInput = z.infer<typeof transporteFormSchema>;
export type ItemInput = z.infer<typeof itemFormSchema>;
export type OVInput = z.infer<typeof ovFormSchema>;
