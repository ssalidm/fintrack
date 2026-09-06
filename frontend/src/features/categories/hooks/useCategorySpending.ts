import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import type { MonthlyCategorySpending } from '../api/types'

function getCurrentMonthStart() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}-01`
}

export const categorySpendingQueryKeys = {
  all: ['reports', 'category-spending'] as const,
  month: (monthStart: string) =>
    ['reports', 'category-spending', monthStart] as const,
}

export function useCategorySpending() {
  const request = useAuthenticatedRequest()
  const monthStart = getCurrentMonthStart()

  return useQuery({
    queryKey: categorySpendingQueryKeys.month(monthStart),
    queryFn: async ({ signal }) => {
      const parameters = new URLSearchParams({
        fromMonth: monthStart,
        toMonth: monthStart,
      })

      const response = await request<MonthlyCategorySpending[]>(
        `/reports/category-spending?${parameters.toString()}`,
        { signal },
      )

      return response.data
    },
    staleTime: 60_000,
  })
}