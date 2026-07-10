import { z } from 'zod';

function parseJanela(val: string): { inicio: number; fim: number } | null {
  const match = val.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [h1, m1, h2, m2] = [match[1], match[2], match[3], match[4]].map(Number);
  if (h1 > 23 || m1 > 59 || h2 > 23 || m2 > 59) return null;
  const inicio = h1 * 60 + m1;
  const fim = h2 * 60 + m2;
  if (fim <= inicio) return null;
  return { inicio, fim };
}

const janelaSchema = z.string().refine(
  (val) => {
    if (!val) return true;
    return parseJanela(val) !== null;
  },
  { message: 'Formato inválido. Use HH:MM-HH:MM (ex: 08:00-12:00).' },
);

export const agendamentoFormSchema = z.object({
  dataEntrega: z.string().min(1, 'Informe a data de entrega'),
  janela: janelaSchema.optional().default(''),
});

export type AgendamentoInput = z.infer<typeof agendamentoFormSchema>;
