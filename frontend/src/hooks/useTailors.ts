import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tailorsApi } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/queryClient'
import { useAuthEnabled } from './useAuthEnabled'
import type { CreateTailorInput, UpdateTailorInput } from '@/types'

export function useTailors() {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.tailors,
    queryFn: tailorsApi.list,
    enabled,
  })
}

export function useTailor(id: string) {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.tailor(id),
    queryFn: () => tailorsApi.getById(id),
    enabled: enabled && !!id,
  })
}

export function useCreateTailor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTailorInput) => tailorsApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.tailors })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
    },
  })
}

export function useUpdateTailor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTailorInput }) =>
      tailorsApi.update(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.tailors })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.tailor(id) })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
    },
  })
}

export function useDeleteTailor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tailorsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.tailors })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
    },
  })
}
