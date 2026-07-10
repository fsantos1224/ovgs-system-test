import type { IOrdemVendaRepository } from '../ports/IOrdemVendaRepository';
import type { OVStatus } from '../../domain/entities/OrdemVenda';
import { canTransition } from '../../domain/entities/OrdemVenda';

export class AlterarStatusOVUseCase {
  constructor(private readonly repo: IOrdemVendaRepository) {}

  async executar(id: string, novoStatus: OVStatus) {
    const ov = await this.repo.obterPorId(id);

    if (!canTransition(ov.status, novoStatus)) {
      throw new Error(`Transição inválida: ${ov.status} → ${novoStatus}. As transições devem ser sequenciais.`);
    }

    return this.repo.alterarStatus(id, novoStatus);
  }
}
