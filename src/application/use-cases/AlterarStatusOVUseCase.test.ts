import { describe, it, expect, vi } from 'vitest';
import { AlterarStatusOVUseCase } from './AlterarStatusOVUseCase';
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

const ovBase: OrdemVenda = {
  id: '1',
  numero: 'OV-001',
  clienteId: 'c1',
  nomeCliente: 'Cliente A',
  dataEmissao: '2025-01-01',
  dataEntregaPrevista: '2025-01-10',
  transporteId: 't1',
  nomeTransporte: 'Transporte A',
  status: 'CRIADA',
  itens: [],
  valorTotal: 100,
};

describe('AlterarStatusOVUseCase', () => {
  it('executa transição válida', async () => {
    const alterarStatus = vi.fn();
    const repo = mockRepo({
      obterPorId: vi.fn().mockResolvedValue(ovBase),
      alterarStatus,
    });
    const useCase = new AlterarStatusOVUseCase(repo);

    await useCase.executar('1', 'PLANEJADA');

    expect(alterarStatus).toHaveBeenCalledWith('1', 'PLANEJADA');
  });

  it('rejeita transição inválida', async () => {
    const repo = mockRepo({
      obterPorId: vi.fn().mockResolvedValue(ovBase),
    });
    const useCase = new AlterarStatusOVUseCase(repo);

    await expect(useCase.executar('1', 'ENTREGUE')).rejects.toThrow('Transição inválida');
  });

  it('lança erro se OV não existir', async () => {
    const repo = mockRepo({
      obterPorId: vi.fn().mockRejectedValue(new Error('OV não encontrada')),
    });
    const useCase = new AlterarStatusOVUseCase(repo);

    await expect(useCase.executar('999', 'PLANEJADA')).rejects.toThrow('OV não encontrada');
  });
});
