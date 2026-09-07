import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type {PageResponse} from '../../../api/types'
import {useAuthenticatedRequest} from '../../auth/hooks/useAuthenticatedRequest'

import type {
  CreateGoalContributionRequest,
  CreateSavingsGoalRequest,
  GoalContribution,
  GoalContributionStatus,
  GoalVersionRequest,
  SavingsGoal,
  SavingsGoalStatus,
  UpdateGoalContributionRequest,
  UpdateSavingsGoalRequest,
  VoidGoalContributionRequest,
} from '../api/types'

export const goalQueryKeys = {
  all: ['goals'] as const,

  list: (status: SavingsGoalStatus) =>
    ['goals', 'list', status] as const,

  contributions: (
    goalId: string,
    status: GoalContributionStatus,
    page: number,
    size: number,
  ) =>
    [
      'goals',
      goalId,
      'contributions',
      status,
      page,
      size,
    ] as const,
}

export function useGoals(
  status: SavingsGoalStatus = 'ACTIVE',
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: goalQueryKeys.list(status),

    queryFn: async ({signal}) => {
      const response =
        await request<SavingsGoal[]>(
          `/goals?status=${status}`,
          {signal},
        )

      return response.data
    },
  })
}

export function useGoalContributions(
  goalId: string,
  status: GoalContributionStatus,
  page: number,
  size = 10,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: goalQueryKeys.contributions(
      goalId,
      status,
      page,
      size,
    ),

    enabled: goalId.length > 0,

    queryFn: async ({signal}) => {
      const parameters =
        new URLSearchParams({
          status,
          page: String(page),
          size: String(size),
        })

      const response =
        await request<
          PageResponse<GoalContribution>
        >(
          `/goals/${goalId}/contributions?${parameters.toString()}`,
          {signal},
        )

      return response.data
    },
  })
}

export function useCreateGoal() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: CreateSavingsGoalRequest,
    ) => {
      const response =
        await request<SavingsGoal>(
          '/goals',
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: goalQueryKeys.all,
      })
    },
  })
}

interface UpdateGoalVariables {
  goalId: string
  payload: UpdateSavingsGoalRequest
}

export function useUpdateGoal() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      payload,
    }: UpdateGoalVariables) => {
      const response =
        await request<SavingsGoal>(
          `/goals/${goalId}`,
          {
            method: 'PATCH',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: goalQueryKeys.all,
      })
    },
  })
}

interface GoalActionVariables {
  goalId: string
  payload: GoalVersionRequest
}

function useGoalAction(
  action: 'complete' | 'archive',
) {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      payload,
    }: GoalActionVariables) => {
      const response =
        await request<SavingsGoal>(
          `/goals/${goalId}/${action}`,
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: goalQueryKeys.all,
      })
    },
  })
}

export function useCompleteGoal() {
  return useGoalAction('complete')
}

export function useArchiveGoal() {
  return useGoalAction('archive')
}

interface AddContributionVariables {
  goalId: string
  payload: CreateGoalContributionRequest
}

export function useAddGoalContribution() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      payload,
    }: AddContributionVariables) => {
      const response =
        await request<SavingsGoal>(
          `/goals/${goalId}/contributions`,
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: goalQueryKeys.all,
      })
    },
  })
}

interface UpdateContributionVariables {
  goalId: string
  contributionId: string
  payload: UpdateGoalContributionRequest
}

export function useUpdateGoalContribution() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      contributionId,
      payload,
    }: UpdateContributionVariables) => {
      const response =
        await request<SavingsGoal>(
          `/goals/${goalId}/contributions/${contributionId}`,
          {
            method: 'PATCH',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: goalQueryKeys.all,
      })
    },
  })
}

interface VoidContributionVariables {
  goalId: string
  contributionId: string
  payload: VoidGoalContributionRequest
}

export function useVoidGoalContribution() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      contributionId,
      payload,
    }: VoidContributionVariables) => {
      const response =
        await request<SavingsGoal>(
          `/goals/${goalId}/contributions/${contributionId}/void`,
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: goalQueryKeys.all,
      })
    },
  })
}