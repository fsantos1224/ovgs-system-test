export interface TipoTransporte {
  id: string;
  nome: string;
  modal: 'rodoviario' | 'aereo' | 'maritimo' | 'ferroviario';
  ativo: boolean;
}
