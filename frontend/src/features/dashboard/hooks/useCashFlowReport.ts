import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import type { MonthlyCashFlow } from '../api/types'

function formatMonthStart(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}-01`
}

function getCashFlowRange(monthCount: number) {
  const today = new Date()

  const fromDate = new Date(
    today.getFullYear(),
    today.getMonth() - (monthCount - 1),
    1,
  )

  const toDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  )

  return {
    fromMonth: formatMonthStart(fromDate),
    toMonth: formatMonthStart(toDate),
  }
}

export const cashFlowQueryKeys = {
  all: ['reports', 'cash-flow'] as const,
  range: (fromMonth: string, toMonth: string) =>
    ['reports', 'cash-flow', fromMonth, toMonth] as const,
}

export function useCashFlowReport(monthCount = 6) {
  const request = useAuthenticatedRequest()
  const { fromMonth, toMonth } =
    getCashFlowRange(monthCount)

  return useQuery({
    queryKey: cashFlowQueryKeys.range(
      fromMonth,
      toMonth,
    ),
    queryFn: async ({ signal }) => {
      const parameters = new URLSearchParams({
        fromMonth,
        toMonth,
      })

      const response = await request<MonthlyCashFlow[]>(
        `/reports/cash-flow?${parameters.toString()}`,
        { signal },
      )

      return response.data
    },
    staleTime: 60_000,
  })
}