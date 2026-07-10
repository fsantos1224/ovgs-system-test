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

const USER_KEY = "XPTO:user";
const ROLE_KEY = "XPTO:role";

function getStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  login: (email, senha) => {
    const encontrado = USUARIOS.find((u) => u.email === email && u.senha === senha);
    if (!encontrado) return "Credenciais inválidas";
    const info: UserInfo = { email: encontrado.email, nome: encontrado.nome, role: encontrado.role };
    localStorage.setItem(USER_KEY, JSON.stringify(info));
    localStorage.setItem(ROLE_KEY, info.role);
    set({ user: info });
    return null;
  },
  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    set({ user: null });
  },
}));

export function getCurrentUser(): UserInfo | null {
  return getStoredUser();
}
