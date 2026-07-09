// Hook de fetch genérico. useEffect + useState. Não precisa de TanStack Query.
// Para cache e revalidação automática, usamos key + forcedRefresh pattern.

import { useEffect, useState } from "react";
import { apiGet } from "../api/fetch";

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFetch<T>(path: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGet<T>(path)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { data, loading, error, refresh };
}
