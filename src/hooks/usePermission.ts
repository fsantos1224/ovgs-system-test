// 🐴 RBAC simplificado: objeto de configuração + hook. Sem Context, sem Provider global.
// Para um projeto maior, buscaríamos as permissões duma rota /me.

import type { UserRole } from '../domain/types';

type Permissao = string;

interface RBACConfig {
  role: UserRole['role'];
  permissoes: Permissao[];
}

// 🐴 Hardcoded. Futuramente viria da API num GET /me.
const USUARIO_ATUAL: RBACConfig = {
  role: 'admin',
  permissoes: [
    'ov:listar', 'ov:criar', 'ov:editar', 'ov:excluir', 'ov:alterar_status',
    'clientes:listar', 'clientes:criar', 'clientes:editar',
    'transportes:listar', 'transportes:criar', 'transportes:editar',
    'itens:listar', 'itens:criar', 'itens:editar',
    'agendamento:ver', 'agendamento:criar',
    'auditoria:ver',
  ],
};

export function usePermissao(permissao: Permissao): boolean {
  return USUARIO_ATUAL.permissoes.includes(permissao);
}

export function useRole(): UserRole['role'] {
  return USUARIO_ATUAL.role;
}