import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import type { UserSession } from '../api/types'

export const profileSessionsQueryKey = [
  'profile',
  'sessions',
] as const

export function useProfileSessions() {
  const request =
    useAuthenticatedRequest()

  return useQuery({
    queryKey:
      profileSessionsQueryKey,

    queryFn: async ({
      signal,
    }) => {
      const response =
        await request<
          UserSession[]
        >(
          '/profile/sessions',
          {
            signal,
          },
        )

      return response.data
    },
  })
}

export function useRevokeProfileSession() {
  const request =
    useAuthenticatedRequest()

  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: async (
      sessionId: string,
    ) => {
      await request<void>(
        `/profile/sessions/${sessionId}/revoke`,
        {
          method: 'POST',
        },
      )
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey:
            profileSessionsQueryKey,
        },
      )
    },
  })
}

export function useRevokeOtherProfileSessions() {
  const request =
    useAuthenticatedRequest()

  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await request<void>(
        '/profile/sessions/revoke-others',
        {
          method: 'POST',
        },
      )
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey:
            profileSessionsQueryKey,
        },
      )
    },
  })
}