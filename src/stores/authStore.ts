import { create } from "zustand";
import { USUARIOS } from "../auth/credentials";

interface UserInfo {
  email: string;
  nome: string;
  role: "admin" | "manager" | "operator" | "viewer";
}

interface AuthState {
  user: UserInfo | null;
  login: (email: string, senha: string) => string | null;
  logout: () => void;
}

const AUTH_KEY = "xpto:auth:user"; // ponytail: stub de auth — guardamos só o perfil, não token (json-server não valida nada)

function loadStoredUser(): UserInfo | null {
  // ponytail: try/catch pq localStorage pode estar bloqueado (modo privado, quota); falhar = voltar pro login, comportamento aceitável
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadStoredUser(),
  login: (email, senha) => {
    const encontrado = USUARIOS.find((u) => u.email === email && u.senha === senha);
    if (!encontrado) return "Credenciais inválidas";
    const user = { email: encontrado.email, nome: encontrado.nome, role: encontrado.role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    set({ user });
    return null;
  },
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ user: null });
  },
}));

export function getCurrentUser(): UserInfo | null {
  return useAuthStore.getState().user;
}
