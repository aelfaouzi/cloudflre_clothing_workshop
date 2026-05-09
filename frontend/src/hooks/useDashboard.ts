import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/queryClient'
import { useAuthEnabled } from './useAuthEnabled'

export function useDashboard() {
  const enabled = useAuthEnabled()
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: dashboardApi.get,
    enabled,
    refetchInterval: enabled ? 30_000 : false,
  })
}
