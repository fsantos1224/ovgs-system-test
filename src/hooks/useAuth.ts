import { useState, useCallback } from 'react';
import { USUARIOS } from '../auth/credentials';
import type { UserRole } from '../domain/types';

interface UserInfo {
  email: string;
  nome: string;
  role: UserRole['role'];
}

const USER_KEY = 'ovgs:user';
const ROLE_KEY = 'ovgs:role';

function getStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: UserInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, user.role);
}

function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(getStoredUser);

  const login = useCallback((email: string, senha: string): string | null => {
    const encontrado = USUARIOS.find((u) => u.email === email && u.senha === senha);
    if (!encontrado) return 'Credenciais inválidas';
    const info: UserInfo = { email: encontrado.email, nome: encontrado.nome, role: encontrado.role };
    storeUser(info);
    setUser(info);
    return null;
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUser(null);
    window.location.reload();
  }, []);

  return { user, login, logout, isAuthenticated: user !== null };
}

export function getCurrentUser(): UserInfo | null {
  return getStoredUser();
}
