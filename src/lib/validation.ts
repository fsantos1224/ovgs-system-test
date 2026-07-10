import { z } from 'zod';
import {
  clienteFormSchema,
  transporteFormSchema,
  itemFormSchema,
  ovFormSchema,
  agendamentoFormSchema,
  loginFormSchema,
} from '../schemas';

export const clienteSchema = clienteFormSchema;
export const transporteSchema = transporteFormSchema;
export const itemSchema = itemFormSchema;
export const ovSchema = ovFormSchema;
export const agendamentoSchema = agendamentoFormSchema;
export const loginSchema = loginFormSchema;

export type ClienteInput = z.input<typeof clienteFormSchema>;
export type TransporteInput = z.input<typeof transporteFormSchema>;
export type ItemInput = z.input<typeof itemFormSchema>;
export type OVInput = z.input<typeof ovFormSchema>;
export type AgendamentoInput = z.input<typeof agendamentoFormSchema>;
export type LoginInput = z.input<typeof loginFormSchema>;
