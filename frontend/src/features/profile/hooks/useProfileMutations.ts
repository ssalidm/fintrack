import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {useAuthenticatedRequest} from '../../auth/hooks/useAuthenticatedRequest'
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  UpdateUserProfileRequest,
  UserProfile,
} from '../api/types'
import {profileQueryKey} from './useProfile'

export function useUpdateProfile() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: UpdateUserProfileRequest,
    ) => {
      const response = await request<UserProfile>(
        '/profile',
        {
          method: 'PATCH',
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(
        profileQueryKey,
        profile,
      )
    },
  })
}

export function useChangePassword() {
  const request = useAuthenticatedRequest()

  return useMutation({
    mutationFn: async (
      payload: ChangePasswordRequest,
    ) => {
      await request<void>(
        '/profile/change-password',
        {
          method: 'POST',
          body: payload,
        },
      )
    },
  })
}

export function useChangeEmail() {
  const request = useAuthenticatedRequest()

  return useMutation({
    mutationFn: async (
      payload: ChangeEmailRequest,
    ) => {
      await request<void>('/profile/change-email', {
        method: 'POST',
        body: payload,
      })
    },
  })
}