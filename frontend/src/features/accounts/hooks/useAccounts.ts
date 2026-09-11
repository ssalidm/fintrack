import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { dashboardSummaryQueryKey } from '../../dashboard/hooks/useDashboardSummary'
import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import type {
  Account,
  AccountBalance,
  AccountStatus,
  ArchiveAccountRequest,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../api/types'

export const accountQueryKeys = {
  all: ['accounts'] as const,
  list: (status: AccountStatus) =>
    ['accounts', 'list', status] as const,
  balances: ['accounts', 'balances'] as const,
}

export function useAccounts(
  status: AccountStatus = 'ACTIVE',
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: accountQueryKeys.list(status),
    queryFn: async ({ signal }) => {
      const response = await request<Account[]>(
        `/accounts?status=${status}`,
        { signal },
      )

      return response.data
    },
  })
}

export function useAccountBalances() {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: accountQueryKeys.balances,
    queryFn: async ({ signal }) => {
      const response = await request<AccountBalance[]>(
        '/reports/account-balances',
        { signal },
      )

      return response.data
    },
  })
}

async function invalidateFinancialData(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: accountQueryKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: dashboardSummaryQueryKey,
    }),
  ])
}

export function useCreateAccount() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAccountRequest) => {
      const response = await request<Account>('/accounts', {
        method: 'POST',
        body: payload,
      })

      return response.data
    },
    onSuccess: async () => {
      await invalidateFinancialData(queryClient)
    },
  })
}

interface UpdateAccountVariables {
  accountId: string
  payload: UpdateAccountRequest
}

export function useUpdateAccount() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         accountId,
                         payload,
                       }: UpdateAccountVariables) => {
      const response = await request<Account>(
        `/accounts/${accountId}`,
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

interface ArchiveAccountVariables {
  accountId: string
  payload: ArchiveAccountRequest
}

export function useArchiveAccount() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         accountId,
                         payload,
                       }: ArchiveAccountVariables) => {
      const response = await request<Account>(
        `/accounts/${accountId}/archive`,
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
