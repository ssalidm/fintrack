import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {useAuthenticatedRequest} from '../../auth/hooks/useAuthenticatedRequest'

import type {
  Budget,
  BudgetPerformance,
  BudgetStatus,
  BudgetSummary,
  BudgetVersionRequest,
  CreateBudgetLimitRequest,
  CreateBudgetRequest,
  UpdateBudgetLimitRequest,
  UpdateBudgetRequest,
} from '../api/types'

export const budgetQueryKeys = {
  all: ['budgets'] as const,

  list: (status: BudgetStatus) =>
    ['budgets', 'list', status] as const,

  detail: (budgetId: string) =>
    ['budgets', 'detail', budgetId] as const,

  performance: (budgetId: string) =>
    [
      'budgets',
      'performance',
      budgetId,
    ] as const,
}

export function useBudgets(
  status: BudgetStatus = 'ACTIVE',
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey:
      budgetQueryKeys.list(status),

    queryFn: async ({signal}) => {
      const response =
        await request<BudgetSummary[]>(
          `/budgets?status=${status}`,
          {signal},
        )

      return response.data
    },
  })
}

export function useBudget(
  budgetId: string,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey:
      budgetQueryKeys.detail(budgetId),

    enabled: budgetId.length > 0,

    queryFn: async ({signal}) => {
      const response =
        await request<Budget>(
          `/budgets/${budgetId}`,
          {signal},
        )

      return response.data
    },
  })
}

export function useBudgetPerformance(
  budgetId: string,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey:
      budgetQueryKeys.performance(
        budgetId,
      ),

    enabled: budgetId.length > 0,

    queryFn: async ({signal}) => {
      const response =
        await request<BudgetPerformance>(
          `/reports/budgets/${budgetId}/performance`,
          {signal},
        )

      return response.data
    },
  })
}

async function invalidateBudgets(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({
    queryKey: budgetQueryKeys.all,
  })
}

export function useCreateBudget() {
  const request =
    useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: CreateBudgetRequest,
    ) => {
      const response =
        await request<Budget>(
          '/budgets',
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await invalidateBudgets(
        queryClient,
      )
    },
  })
}

interface UpdateBudgetVariables {
  budgetId: string
  payload: UpdateBudgetRequest
}

export function useUpdateBudget() {
  const request =
    useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      payload,
    }: UpdateBudgetVariables) => {
      const response =
        await request<Budget>(
          `/budgets/${budgetId}`,
          {
            method: 'PATCH',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await invalidateBudgets(
        queryClient,
      )
    },
  })
}

interface ArchiveBudgetVariables {
  budgetId: string
  payload: BudgetVersionRequest
}

export function useArchiveBudget() {
  const request =
    useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      payload,
    }: ArchiveBudgetVariables) => {
      const response =
        await request<Budget>(
          `/budgets/${budgetId}/archive`,
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await invalidateBudgets(
        queryClient,
      )
    },
  })
}

interface AddBudgetLimitVariables {
  budgetId: string
  payload: CreateBudgetLimitRequest
}

export function useAddBudgetLimit() {
  const request =
    useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      payload,
    }: AddBudgetLimitVariables) => {
      const response =
        await request<Budget>(
          `/budgets/${budgetId}/limits`,
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await invalidateBudgets(
        queryClient,
      )
    },
  })
}

interface UpdateBudgetLimitVariables {
  budgetId: string
  limitId: string
  payload: UpdateBudgetLimitRequest
}

export function useUpdateBudgetLimit() {
  const request =
    useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      limitId,
      payload,
    }: UpdateBudgetLimitVariables) => {
      const response =
        await request<Budget>(
          `/budgets/${budgetId}/limits/${limitId}`,
          {
            method: 'PATCH',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await invalidateBudgets(
        queryClient,
      )
    },
  })
}

interface DeleteBudgetLimitVariables {
  budgetId: string
  limitId: string
  version: number
}

export function useDeleteBudgetLimit() {
  const request =
    useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      limitId,
      version,
    }: DeleteBudgetLimitVariables) => {
      await request<void>(
        `/budgets/${budgetId}/limits/${limitId}?version=${version}`,
        {
          method: 'DELETE',
        },
      )
    },

    onSuccess: async () => {
      await invalidateBudgets(
        queryClient,
      )
    },
  })
}