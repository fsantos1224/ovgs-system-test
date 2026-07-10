import { z } from 'zod';
import { getCurrentUser } from '../stores/authStore';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  const user = getCurrentUser();
  return user ? { 'x-user': user.email } : {};
}

async function buildError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    return new ApiError(body.error || `HTTP ${res.status}`, res.status);
  } catch {
    return new ApiError(`HTTP ${res.status}`, res.status);
  }
}

export async function apiGet<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw await buildError(res);
  const json = await res.json();
  return schema.parse(json);
}

export async function apiGetPaginated<T>(path: string, schema: z.ZodType<T>): Promise<{ data: T; totalCount: number }> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw await buildError(res);
  const totalCount = parseInt(res.headers.get('X-Total-Count') ?? '0', 10);
  const json = await res.json();
  return { data: schema.parse(json), totalCount };
}

export async function apiPost<T, B>(
  path: string,
  body: B,
  schema: z.ZodType<T>,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...extraHeaders },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await buildError(res);
  const json = await res.json();
  return schema.parse(json);
}

export async function apiPatch<T, B>(path: string, body: Partial<B>, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await buildError(res);
  const json = await res.json();
  return schema.parse(json);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw await buildError(res);
}
