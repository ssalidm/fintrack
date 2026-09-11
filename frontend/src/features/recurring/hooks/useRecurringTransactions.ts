import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {useAuthenticatedRequest} from '../../auth/hooks/useAuthenticatedRequest'
import type {
  CreateRecurringTransactionRequest,
  RecurringTransaction,
  RecurringTransactionOccurrence,
  RecurringTransactionStatus,
  RecurringTransactionVersionRequest,
  UpdateRecurringTransactionRequest,
} from '../api/types'

export const recurringTransactionQueryKeys = {
  all: ['recurring-transactions'] as const,
  list: (status: RecurringTransactionStatus) =>
    ['recurring-transactions', 'list', status] as const,
  detail: (scheduleId: string) =>
    ['recurring-transactions', 'detail', scheduleId] as const,
}

async function invalidateFinancialData(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: recurringTransactionQueryKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: ['transactions'],
    }),
    queryClient.invalidateQueries({
      queryKey: ['accounts'],
    }),
    queryClient.invalidateQueries({
      queryKey: ['dashboard'],
    }),
    queryClient.invalidateQueries({
      queryKey: ['cash-flow'],
    }),
    queryClient.invalidateQueries({
      queryKey: ['category-spending'],
    }),
  ])
}

export function useRecurringTransactions(
  status: RecurringTransactionStatus = 'ACTIVE',
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey:
      recurringTransactionQueryKeys.list(status),
    queryFn: async ({signal}) => {
      const parameters = new URLSearchParams({
        status,
      })

      const response = await request<
        RecurringTransaction[]
      >(
        `/recurring-transactions?${parameters.toString()}`,
        {signal},
      )

      return response.data
    },
  })
}

export function useRecurringTransaction(
  scheduleId: string | null,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey:
      recurringTransactionQueryKeys.detail(
        scheduleId ?? '',
      ),
    enabled: Boolean(scheduleId),
    queryFn: async ({signal}) => {
      const response =
        await request<RecurringTransaction>(
          `/recurring-transactions/${scheduleId}`,
          {signal},
        )

      return response.data
    },
  })
}

export function useCreateRecurringTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: CreateRecurringTransactionRequest,
    ) => {
      const response =
        await request<RecurringTransaction>(
          '/recurring-transactions',
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

interface UpdateRecurringTransactionVariables {
  scheduleId: string
  payload: UpdateRecurringTransactionRequest
}

export function useUpdateRecurringTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         scheduleId,
                         payload,
                       }: UpdateRecurringTransactionVariables) => {
      const response =
        await request<RecurringTransaction>(
          `/recurring-transactions/${scheduleId}`,
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

interface RecurringTransactionActionVariables {
  scheduleId: string
  payload: RecurringTransactionVersionRequest
}

export function usePauseRecurringTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         scheduleId,
                         payload,
                       }: RecurringTransactionActionVariables) => {
      const response =
        await request<RecurringTransaction>(
          `/recurring-transactions/${scheduleId}/pause`,
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

export function useResumeRecurringTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         scheduleId,
                         payload,
                       }: RecurringTransactionActionVariables) => {
      const response =
        await request<RecurringTransaction>(
          `/recurring-transactions/${scheduleId}/resume`,
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

export function useArchiveRecurringTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         scheduleId,
                         payload,
                       }: RecurringTransactionActionVariables) => {
      const response =
        await request<RecurringTransaction>(
          `/recurring-transactions/${scheduleId}/archive`,
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

export function usePostDueRecurringTransaction() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         scheduleId,
                         payload,
                       }: RecurringTransactionActionVariables) => {
      const response =
        await request<RecurringTransactionOccurrence>(
          `/recurring-transactions/${scheduleId}/post-due`,
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