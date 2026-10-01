import {useQuery} from '@tanstack/react-query'
import {useAuthenticatedRequest} from '@/features/auth/hooks/useAuthenticatedRequest'
import type {DashboardSummary} from '@/features/dashboard/api/types'

export const dashboardSummaryQueryKey = [
  'dashboard',
  'summary',
] as const

export function useDashboardSummary() {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: dashboardSummaryQueryKey,
    queryFn: async ({signal}) => {
      const response = await request<DashboardSummary>(
        '/dashboard/summary',
        {signal},
      )

      return response.data
    },
  })
}
