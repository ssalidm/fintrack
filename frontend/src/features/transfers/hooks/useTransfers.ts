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
import { transactionQueryKeys } from '../../transactions/hooks/useTransactions'
import type {
  CreateTransferRequest,
  Transfer,
  TransferFilters,
  VoidTransferRequest,
} from '../api/types'

export const defaultTransferFilters: TransferFilters = {
  status: 'POSTED',
  page: 0,
  size: 25,
}

export const transferQueryKeys = {
  all: ['transfers'] as const,

  list: (filters: TransferFilters) =>
    ['transfers', 'list', filters] as const,

  detail: (transferId: string) =>
    ['transfers', 'detail', transferId] as const,
}

function buildTransferPath(filters: TransferFilters) {
  const parameters = new URLSearchParams({
    status: filters.status,
    page: String(filters.page),
    size: String(filters.size),
  })

  if (filters.sourceAccountId) {
    parameters.set(
      'sourceAccountId',
      filters.sourceAccountId,
    )
  }

  if (filters.destinationAccountId) {
    parameters.set(
      'destinationAccountId',
      filters.destinationAccountId,
    )
  }

  if (filters.fromDate) {
    parameters.set('fromDate', filters.fromDate)
  }

  if (filters.toDate) {
    parameters.set('toDate', filters.toDate)
  }

  return `/transfers?${parameters.toString()}`
}

async function invalidateTransferData(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: transferQueryKeys.all,
    }),
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

export function useTransfers(
  filters: TransferFilters,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: transferQueryKeys.list(filters),
    queryFn: async ({ signal }) => {
      const response = await request<
        PageResponse<Transfer>
      >(buildTransferPath(filters), { signal })

      return response.data
    },
  })
}

export function useTransfer(
  transferId: string | null,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: transferQueryKeys.detail(
      transferId ?? 'none',
    ),
    enabled: Boolean(transferId),
    queryFn: async ({ signal }) => {
      if (!transferId) {
        throw new Error('Transfer id is required')
      }

      const response = await request<Transfer>(
        `/transfers/${transferId}`,
        { signal },
      )

      return response.data
    },
  })
}

export function useCreateTransfer() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: CreateTransferRequest,
    ) => {
      const response = await request<Transfer>(
        '/transfers',
        {
          method: 'POST',
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async () => {
      await invalidateTransferData(queryClient)
    },
  })
}

interface VoidTransferVariables {
  transferId: string
  payload: VoidTransferRequest
}

export function useVoidTransfer() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transferId,
      payload,
    }: VoidTransferVariables) => {
      const response = await request<Transfer>(
        `/transfers/${transferId}/void`,
        {
          method: 'POST',
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async () => {
      await invalidateTransferData(queryClient)
    },
  })
}