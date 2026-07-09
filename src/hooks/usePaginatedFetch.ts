// Hook de fetch paginado. usa os params nativos do json-server (_page, _limit, _sort, etc.)
// Sem virtualização, sem TanStack Query, sem libs de lista infinita.

import { useEffect, useState, useCallback } from "react";
import { apiGetPaginated } from "../api/fetch";

interface PaginatedResult<T> {
  data: T | null;
  loading: boolean;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  setFilters: (f: Record<string, string>) => void;
  refresh: () => void;
}

export function usePaginatedFetch<T>(
  basePath: string,
  pageSize = 20,
): PaginatedResult<T> {
  const [page, setPageRaw] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const setPage = useCallback((p: number) => setPageRaw(Math.max(1, p)), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      _page: String(page),
      _limit: String(pageSize),
    });
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }

    apiGetPaginated<T>(`${basePath}?${params}`)
      .then(({ data, totalCount }) => {
        if (!cancelled) {
          setData(data);
          setTotalCount(totalCount);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [basePath, page, pageSize, filters, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    data,
    loading,
    page,
    totalPages,
    setPage,
    setFilters,
    refresh: () => {
      setRefreshKey((k) => k + 1);
    },
  };
}
