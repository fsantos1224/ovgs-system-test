import type { PaginatedResult } from './DTOs';

export interface IApiClient {
  get<T>(path: string): Promise<T>;
  getPaginated<T>(path: string): Promise<PaginatedResult<T>>;
  post<T, B>(path: string, body: B): Promise<T>;
  patch<T, B>(path: string, body: Partial<B>): Promise<T>;
  delete(path: string): Promise<void>;
}
