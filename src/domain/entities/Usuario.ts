export type Role = 'admin' | 'manager' | 'operator' | 'viewer';

export interface Usuario {
  email: string;
  senha: string;
  role: Role;
  nome: string;
}

export interface UserRole {
  role: Role;
  nome: string;
}
