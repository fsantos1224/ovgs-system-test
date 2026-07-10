import type { IOrdemVendaRepository, CriarOVPayload } from '../ports/IOrdemVendaRepository';

export class CriarOrdemVendaUseCase {
  constructor(private readonly repo: IOrdemVendaRepository) {}

  async executar(payload: CriarOVPayload, extraHeaders?: Record<string, string>) {
    return this.repo.criar(payload, extraHeaders);
  }
}
