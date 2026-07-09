// RBAC: objeto de configuração + hook. Sem CASL, sem libs, sem Provider.
// Role do user persiste em localStorage e pode ser alterada via UI.

import type { UserRole } from "../domain/types";

type Permissao = string;

// Matriz de permissões por role. Hierarquia: admin > manager > operator > viewer.
// Cada role herda as permissões da role anterior e adiciona as suas.
const PERMISSOES_POR_ROLE: Record<UserRole["role"], Permissao[]> = {
  viewer: [
    "ov:listar",
    "clientes:listar",
    "transportes:listar",
    "itens:listar",
  ],
  operator: [
    "ov:criar",
    "ov:editar",
    "ov:alterar_status",
    "clientes:criar",
    "transportes:criar",
    "itens:criar",
    "agendamento:ver",
  ],
  manager: [
    "ov:excluir",
    "clientes:editar",
    "transportes:editar",
    "itens:editar",
    "agendamento:criar",
    "auditoria:ver",
  ],
  admin: [
    "ov:listar_todas",
    "clientes:excluir",
    "transportes:excluir",
    "itens:excluir",
    "admin:gerenciar_usuarios",
  ],
};

const ROLE_KEY = "ovgs:role";

function getRole(): UserRole["role"] {
  return (localStorage.getItem(ROLE_KEY) as UserRole["role"]) ?? "admin";
}

export function setRole(role: UserRole["role"]) {
  localStorage.setItem(ROLE_KEY, role);
  window.location.reload(); // simplificação: reload para resetar estado
}

function getPermissoes(): Permissao[] {
  const role = getRole();
  const roles: UserRole["role"][] = ["viewer", "operator", "manager", "admin"];
  const idx = roles.indexOf(role);
  if (idx < 0) return [];

  // Hierarquia: cada role acumula permissões das roles anteriores
  const permissoes: Permissao[] = [];
  for (let i = 0; i <= idx; i++) {
    permissoes.push(...(PERMISSOES_POR_ROLE[roles[i]] ?? []));
  }
  return [...new Set(permissoes)];
}

export function usePermissao(permissao: Permissao): boolean {
  return getPermissoes().includes(permissao);
}

export function useRole(): UserRole["role"] {
  return getRole();
}
