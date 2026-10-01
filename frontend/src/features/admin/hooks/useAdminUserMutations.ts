import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { useAuthenticatedRequest } from '@/features/auth/hooks/useAuthenticatedRequest'
import type {
  AdminUser,
  AdminUserVersionRequest,
} from '@/features/admin/api/types'
import { adminUserQueryKeys } from './useAdminUsers'

interface ChangeAdminUserStatusVariables {
  userId: string
  version: number
}

interface RevokeAdminUserSessionsVariables {
  userId: string
}

function useChangeAdminUserStatus(
  action: 'activate' | 'deactivate',
) {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      version,
    }: ChangeAdminUserStatusVariables) => {
      const payload: AdminUserVersionRequest = { version }
      const response = await request<AdminUser>(
        `/admin/users/${userId}/${action}`,
        {
          method: 'POST',
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(
        adminUserQueryKeys.detail(user.id),
        user,
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminUserQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: adminUserQueryKeys.sessions(user.id),
        }),
      ])
    },
  })
}

export function useActivateAdminUser() {
  return useChangeAdminUserStatus('activate')
}

export function useDeactivateAdminUser() {
  return useChangeAdminUserStatus('deactivate')
}

export function useRevokeAdminUserSessions() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
    }: RevokeAdminUserSessionsVariables) => {
      await request<void>(
        `/admin/users/${userId}/revoke-sessions`,
        { method: 'POST' },
      )

      return userId
    },
    onSuccess: async (userId) => {
      await queryClient.invalidateQueries({
        queryKey: adminUserQueryKeys.sessions(userId),
      })
    },
  })
}
