import {QueryClient} from "@tanstack/react-query";
import {ApiClientError} from "./ApiClientError.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (
          error instanceof ApiClientError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false
        }

        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
