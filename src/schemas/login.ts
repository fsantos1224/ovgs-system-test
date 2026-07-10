import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginFormSchema>;
