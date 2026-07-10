import { QueryClient } from "@tanstack/react-query";
import { useToastStore } from "../stores/toastStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        const msg = error instanceof Error ? error.message : "Erro desconhecido";
        useToastStore.getState().addToast(msg, "error");
      },
    },
  },
});
