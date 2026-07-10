import type { Usuario } from '../domain/types';
import usuarios from '../data/usuarios.json';

// Credenciais fake para demonstração do mock.
// Este arquivo (src/data/usuarios.json) é o seed de contas de teste.
// NÃO é um mecanismo de autenticação real — o json-server não valida senhas.
export const USUARIOS: Usuario[] = usuarios as Usuario[];
