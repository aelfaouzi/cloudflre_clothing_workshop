import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const QUERY_KEYS = {
  fabrics: ['fabrics'] as const,
  fabric: (id: string) => ['fabrics', id] as const,
  lowStock: ['fabrics', 'low-stock'] as const,
  tailors: ['tailors'] as const,
  tailor: (id: string) => ['tailors', id] as const,
  jobs: ['jobs'] as const,
  job: (id: string) => ['jobs', id] as const,
  designs: ['designs'] as const,
  dashboard: ['dashboard'] as const,
}
