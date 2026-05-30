import { QueryClient } from '@tanstack/react-query';
import { HttpError } from './HttpError';

/**
 * Глобальный QueryClient: общие политики кеширования и поведения.
 * Не повторяем запросы, упавшие по 4xx (бессмысленно).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
