// RBAC: objeto de configuração + hook. Sem CASL, sem libs, sem Provider.
// Role do user persiste em localStorage e pode ser alterada via UI.

import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../domain/types';

type Permissao = string;

const PERMISSOES_POR_ROLE: Record<UserRole['role'], Permissao[]> = {
  viewer: ['ov:listar', 'clientes:listar', 'transportes:listar', 'itens:listar'],
  operator: [
    'ov:criar',
    'ov:editar',
    'ov:alterar_status',
    'clientes:criar',
    'transportes:criar',
    'itens:criar',
    'agendamento:ver',
  ],
  manager: [
    'ov:excluir',
    'clientes:editar',
    'transportes:editar',
    'itens:editar',
    'agendamento:criar',
    'auditoria:ver',
  ],
  admin: ['ov:listar_todas', 'clientes:excluir', 'transportes:excluir', 'itens:excluir', 'admin:gerenciar_usuarios'],
};

function getPermissoes(role: UserRole['role']): Permissao[] {
  const roles: UserRole['role'][] = ['viewer', 'operator', 'manager', 'admin'];
  const idx = roles.indexOf(role);
  if (idx < 0) return [];

  const permissoes: Permissao[] = [];
  for (let i = 0; i <= idx; i++) {
    permissoes.push(...(PERMISSOES_POR_ROLE[roles[i]] ?? []));
  }
  return [...new Set(permissoes)];
}

export function usePermissao(permissao: Permissao): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return getPermissoes(role).includes(permissao);
}

export function useRole(): UserRole['role'] | null {
  return useAuthStore((s) => s.user?.role ?? null);
}
