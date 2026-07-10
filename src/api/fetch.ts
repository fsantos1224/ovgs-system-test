// 🐴 fetch wrapper minimalista. Sem axios, sem TanStack Query.
// Para um projeto maior, usaríamos um cliente HTTP com interceptors.

import { getCurrentUser } from "../stores/authStore";

const API_BASE = "/api";

function authHeaders(): Record<string, string> {
  const user = getCurrentUser();
  return user ? { "x-user": user.email } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} falhou: ${res.status}`);
  return res.json();
}

// Variante que expõe X-Total-Count para paginação server-side (json-server nativo)
export async function apiGetPaginated<T>(
  path: string,
): Promise<{ data: T; totalCount: number }> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} falhou: ${res.status}`);
  const totalCount = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
  return { data: await res.json(), totalCount };
}

export async function apiPost<T, B>(
  path: string,
  body: B,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(), ...extraHeaders },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `POST ${path} falhou: ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} falhou: ${res.status}`);
  return res.json();
}

export async function apiPatch<T, B>(
  path: string,
  body: Partial<B>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `PATCH ${path} falhou: ${res.status}`);
  }
  return res.json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`DELETE ${path} falhou: ${res.status}`);
}
