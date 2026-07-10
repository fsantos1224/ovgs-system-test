import { describe, it, expect, vi } from 'vitest';
import { AgendarEntregaUseCase } from './AgendarEntregaUseCase';
import type { IOrdemVendaRepository } from '../ports/IOrdemVendaRepository';
import type { OrdemVenda } from '../../domain/entities/OrdemVenda';

function mockRepo(overrides?: Partial<IOrdemVendaRepository>): IOrdemVendaRepository {
  return {
    listar: vi.fn(),
    obterPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    alterarStatus: vi.fn(),
    excluir: vi.fn(),
    ...overrides,
  };
}

const ovPlanejada: OrdemVenda = {
  id: '1',
  numero: 'OV-001',
  clienteId: 'c1',
  nomeCliente: 'Cliente A',
  dataEmissao: '2025-01-01',
  dataEntregaPrevista: '2025-01-10',
  transporteId: 't1',
  nomeTransporte: 'Transporte A',
  status: 'PLANEJADA',
  itens: [],
  valorTotal: 100,
};

const ovAgendada: OrdemVenda = {
  ...ovPlanejada,
  status: 'AGENDADA',
  janelaAtendimento: '08:00-12:00',
};

describe('AgendarEntregaUseCase', () => {
  it('agenda OV planejada — avança status para AGENDADA', async () => {
    const atualizar = vi.fn().mockResolvedValue({ ...ovPlanejada, status: 'AGENDADA' });
    const repo = mockRepo({
      obterPorId: vi.fn().mockResolvedValue(ovPlanejada),
      atualizar,
    });
    const useCase = new AgendarEntregaUseCase(repo);

    await useCase.executar({ id: '1', dataEntrega: '2025-02-01', janela: '08:00-12:00' });

    expect(atualizar).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        dataEntregaPrevista: expect.any(String),
        janelaAtendimento: '08:00-12:00',
        status: 'AGENDADA',
      }),
    );
  });

  it('reagenda OV já agendada — mantém status AGENDADA', async () => {
    const atualizar = vi.fn().mockResolvedValue(ovAgendada);
    const repo = mockRepo({
      obterPorId: vi.fn().mockResolvedValue(ovAgendada),
      atualizar,
    });
    const useCase = new AgendarEntregaUseCase(repo);

    await useCase.executar({ id: '1', dataEntrega: '2025-03-01', janela: '10:00-14:00' });

    expect(atualizar).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        dataEntregaPrevista: expect.any(String),
        janelaAtendimento: '10:00-14:00',
      }),
    );
    expect(atualizar.mock.calls[0][1]).not.toHaveProperty('status');
  });

  it('rejeita janela com formato inválido', async () => {
    const repo = mockRepo({
      obterPorId: vi.fn().mockResolvedValue(ovPlanejada),
    });
    const useCase = new AgendarEntregaUseCase(repo);

    await expect(useCase.executar({ id: '1', dataEntrega: '2025-02-01', janela: '25:00-26:00' })).rejects.toThrow(
      'Formato inválido',
    );
  });

  it('rejeita OV em status não elegível', async () => {
    const repo = mockRepo({
      obterPorId: vi.fn().mockResolvedValue({ ...ovPlanejada, status: 'CRIADA' }),
    });
    const useCase = new AgendarEntregaUseCase(repo);

    await expect(useCase.executar({ id: '1', dataEntrega: '2025-02-01', janela: '' })).rejects.toThrow(
      'Status inválido',
    );
  });
});
