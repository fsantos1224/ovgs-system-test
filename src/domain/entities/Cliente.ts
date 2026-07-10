export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
  transportesAutorizados: string[];
}

export function canUseTransporte(
  cliente: Pick<Cliente, 'transportesAutorizados'> | null | undefined,
  transporteId: string,
): boolean {
  if (!cliente) return false;
  return cliente.transportesAutorizados?.includes(transporteId) ?? false;
}
