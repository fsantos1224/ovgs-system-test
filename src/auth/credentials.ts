export interface Usuario {
  email: string;
  senha: string;
  role: 'viewer' | 'operator' | 'manager' | 'admin';
  nome: string;
}

export const USUARIOS: Usuario[] = [
  { email: 'admin@ovgs.com', senha: 'admin123', role: 'admin', nome: 'Administrador' },
  { email: 'manager@ovgs.com', senha: 'manager123', role: 'manager', nome: 'Gerente' },
  { email: 'operator@ovgs.com', senha: 'operator123', role: 'operator', nome: 'Operador' },
  { email: 'viewer@ovgs.com', senha: 'viewer123', role: 'viewer', nome: 'Visualizador' },
];
