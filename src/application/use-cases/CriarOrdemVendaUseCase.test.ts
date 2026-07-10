import { describe, it, expect, vi } from 'vitest';
import { CriarOrdemVendaUseCase } from './CriarOrdemVendaUseCase';
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

const novaOVPayload = {
  numero: 'OV-NOVA',
  clienteId: 'c1',
  nomeCliente: 'Cliente A',
  dataEmissao: '2025-01-01',
  dataEntregaPrevista: '2025-01-10',
  transporteId: 't1',
  nomeTransporte: 'Transporte A',
  itens: [{ id: '', itemId: 'i1', nomeItem: 'Item 1', quantidade: 2, precoUnitario: 50 }],
  observacoes: null,
  janelaAtendimento: null,
  status: 'CRIADA' as const,
  valorTotal: 100,
};

const ovCriada: OrdemVenda = {
  id: 'nova-id',
  ...novaOVPayload,
  status: 'CRIADA',
  valorTotal: 100,
};

describe('CriarOrdemVendaUseCase', () => {
  it('cria OV com payload válido', async () => {
    const criar = vi.fn().mockResolvedValue(ovCriada);
    const repo = mockRepo({ criar });
    const useCase = new CriarOrdemVendaUseCase(repo);

    const result = await useCase.executar(novaOVPayload);

    expect(criar).toHaveBeenCalledWith(novaOVPayload, undefined);
    expect(result).toEqual(ovCriada);
  });

  it('repassa headers extras', async () => {
    const criar = vi.fn().mockResolvedValue(ovCriada);
    const repo = mockRepo({ criar });
    const useCase = new CriarOrdemVendaUseCase(repo);
    const headers = { 'x-idempotency-key': 'abc-123' };

    await useCase.executar(novaOVPayload, headers);

    expect(criar).toHaveBeenCalledWith(novaOVPayload, headers);
  });

  it('propaga erro do repositório', async () => {
    const repo = mockRepo({
      criar: vi.fn().mockRejectedValue(new Error('Erro ao criar OV')),
    });
    const useCase = new CriarOrdemVendaUseCase(repo);

    await expect(useCase.executar(novaOVPayload)).rejects.toThrow('Erro ao criar OV');
  });
});
