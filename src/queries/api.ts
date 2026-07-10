import { z } from "zod";
import { getCurrentUser } from "../stores/authStore";

const API_BASE = "/api";

function authHeaders(): Record<string, string> {
  const user = getCurrentUser();
  return user ? { "x-user": user.email } : {};
}

export async function apiGet<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`GET ${path} falhou: ${res.status}`);
  const json = await res.json();
  return schema.parse(json);
}

export async function apiGetPaginated<T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<{ data: T; totalCount: number }> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`GET ${path} falhou: ${res.status}`);
  const totalCount = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
  const json = await res.json();
  return { data: schema.parse(json), totalCount };
}

export { apiPost, apiPut, apiPatch, apiDelete } from "../api/fetch";
