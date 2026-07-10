export interface EventoAuditoria {
  id: string;
  entidade: string;
  entidadeId: string;
  acao: string;
  usuario: string;
  dataHora: string;
  detalhes: string;
  estadoAnterior: string | null | undefined;
  estadoPosterior: string | null | undefined;
}
