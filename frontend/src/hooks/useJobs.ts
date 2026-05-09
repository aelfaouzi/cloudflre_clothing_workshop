import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/queryClient'
import { useAuthEnabled } from './useAuthEnabled'
import type { CreateJobInput, UpdateJobInput, TransitionJobInput } from '@/types'

export function useJobs() {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.jobs,
    queryFn: jobsApi.list,
    enabled,
  })
}

export function useJob(id: string) {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.job(id),
    queryFn: () => jobsApi.getById(id),
    enabled: enabled && !!id,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateJobInput) => jobsApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
    },
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobInput }) =>
      jobsApi.update(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.job(id) })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
    },
  })
}

export function useTransitionJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransitionJobInput }) =>
      jobsApi.transition(id, data),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.job(id) })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.fabrics })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.tailors })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
    },
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs })
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
    },
  })
}
