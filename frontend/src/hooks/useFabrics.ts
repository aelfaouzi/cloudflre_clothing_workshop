import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fabricsApi } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/queryClient'
import { useAuthEnabled } from './useAuthEnabled'
import type { CreateFabricInput, UpdateFabricInput } from '@/types'

export function useFabrics() {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.fabrics,
    queryFn: fabricsApi.list,
    enabled,
  })
}

export function useLowStockFabrics() {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.lowStock,
    queryFn: fabricsApi.lowStock,
    enabled,
  })
}

export function useFabric(id: string) {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.fabric(id),
    queryFn: () => fabricsApi.getById(id),
    enabled: enabled && !!id,
  })
}

export function useCreateFabric() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFabricInput) => fabricsApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.fabrics })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.lowStock })
    },
  })
}

export function useUpdateFabric() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFabricInput }) =>
      fabricsApi.update(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.fabrics })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.fabric(id) })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.lowStock })
    },
  })
}

export function useDeleteFabric() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fabricsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.fabrics })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.lowStock })
    },
  })
}
