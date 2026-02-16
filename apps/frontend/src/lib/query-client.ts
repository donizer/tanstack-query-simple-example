import { QueryClient } from "@tanstack/react-query";
import { noteKeys } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

queryClient.setQueryDefaults(noteKeys.details(), {
  staleTime: 60_000,
});

queryClient.setQueryDefaults(noteKeys.meta(), {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
});
