import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type { PageResponse } from '../../../api/types'
import { accountQueryKeys } from '../../accounts/hooks/useAccounts'
import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import { dashboardSummaryQueryKey } from '../../dashboard/hooks/useDashboardSummary'
import type {
  CreateTransactionRequest,
  Transaction,
  TransactionFilters,
  UpdateTransactionRequest,
  VoidTransactionRequest,
} from '../api/types'

export const defaultTransactionFilters: TransactionFilters = {
  status: 'POSTED',
  page: 0,
  size: 25,
}

export const transactionQueryKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilters) =>
    ['transactions', 'list', filters] as const,
}

function buildTransactionPath(
  filters: TransactionFilters,
) {
  const parameters = new URLSearchParams({
    status: filters.status,
    page: String(filters.page),
    size: String(filters.size),
  })

  if (filters.accountId) {
    parameters.set('accountId', filters.accountId)
  }

  if (filters.categoryId) {
    parameters.set('categoryId', filters.categoryId)
  }

  if (filters.type) {
    parameters.set('type', filters.type)
  }

  if (filters.fromDate) {
    parameters.set('fromDate', filters.fromDate)
  }

  if (filters.toDate) {
    parameters.set('toDate', filters.toDate)
  }

  return `/transactions?${parameters.toString()}`
}

async function invalidateFinancialData(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: transactionQueryKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: accountQueryKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: dashboardSummaryQueryKey,
    }),
  ])
}

export function useTransactions(
  filters: TransactionFilters,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: transactionQueryKeys.list(filters),
    queryFn: async ({ signal }) => {
      const response = await request<
        PageResponse<Transaction>
      >(buildTransactionPath(filters), { signal })

      return response.data
    },
  })
}

export function useCreateTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: CreateTransactionRequest,
    ) => {
      const response = await request<Transaction>(
        '/transactions',
        {
          method: 'POST',
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async () => {
      await invalidateFinancialData(queryClient)
    },
  })
}

interface UpdateTransactionVariables {
  transactionId: string
  payload: UpdateTransactionRequest
}

export function useUpdateTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         transactionId,
                         payload,
                       }: UpdateTransactionVariables) => {
      const response = await request<Transaction>(
        `/transactions/${transactionId}`,
        {
          method: 'PATCH',
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async () => {
      await invalidateFinancialData(queryClient)
    },
  })
}

interface VoidTransactionVariables {
  transactionId: string
  payload: VoidTransactionRequest
}

export function useVoidTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         transactionId,
                         payload,
                       }: VoidTransactionVariables) => {
      const response = await request<Transaction>(
        `/transactions/${transactionId}/void`,
        {
          method: 'POST',
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async () => {
      await invalidateFinancialData(queryClient)
    },
  })
}
