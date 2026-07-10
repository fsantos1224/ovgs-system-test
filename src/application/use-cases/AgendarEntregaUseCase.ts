import type { IOrdemVendaRepository } from '../ports/IOrdemVendaRepository';
import type { OrdemVenda } from '../../domain/entities/OrdemVenda';

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

function validarJanela(janela: string): string | null {
  if (!janela) return null;
  return parseJanela(janela) !== null ? null : 'Formato inválido. Use HH:MM-HH:MM (ex: 08:00-12:00).';
}

interface AgendarInput {
  id: string;
  dataEntrega: string;
  janela: string;
}

export class AgendarEntregaUseCase {
  constructor(private readonly repo: IOrdemVendaRepository) {}

  async executar(input: AgendarInput): Promise<OrdemVenda> {
    const ov = await this.repo.obterPorId(input.id);

    if (ov.status !== 'PLANEJADA' && ov.status !== 'AGENDADA') {
      throw new Error(`Status inválido: ${ov.status}. Apenas ordens PLANEJADA ou AGENDADA podem ser agendadas.`);
    }

    const erroJanela = validarJanela(input.janela);
    if (erroJanela) {
      const err = new Error(erroJanela);
      err.name = 'ValidationError';
      throw err;
    }

    const dataEntregaPrevista = new Date(input.dataEntrega).toISOString();
    const updateData: Record<string, unknown> = {
      dataEntregaPrevista,
      janelaAtendimento: input.janela || null,
    };

    if (ov.status === 'PLANEJADA') {
      updateData.status = 'AGENDADA';
    }

    return this.repo.atualizar(input.id, updateData as Parameters<typeof this.repo.atualizar>[1]);
  }
}
