import { useQuery } from '@tanstack/react-query'

import type { PageResponse } from '@/api/types'
import { useAuthenticatedRequest } from '@/features/auth/hooks/useAuthenticatedRequest'
import type {
  AdminUser,
  AdminUserSession,
} from '@/features/admin/api/types'

export const adminUserQueryKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserQueryKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...adminUserQueryKeys.lists(), page, size] as const,
  details: () => [...adminUserQueryKeys.all, 'detail'] as const,
  detail: (userId: string) =>
    [...adminUserQueryKeys.details(), userId] as const,
  sessions: (userId: string) =>
    [...adminUserQueryKeys.detail(userId), 'sessions'] as const,
  sessionPage: (
    userId: string,
    page: number,
    size: number,
  ) => [
    ...adminUserQueryKeys.sessions(userId),
    page,
    size,
  ] as const,
}

export function useAdminUsers(
  page: number,
  size = 25,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: adminUserQueryKeys.list(page, size),
    queryFn: async ({ signal }) => {
      const parameters = new URLSearchParams({
        page: String(page),
        size: String(size),
      })

      const response = await request<PageResponse<AdminUser>>(
        `/admin/users?${parameters.toString()}`,
        { signal },
      )

      return response.data
    },
  })
}

export function useAdminUser(userId: string) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: adminUserQueryKeys.detail(userId),
    queryFn: async ({ signal }) => {
      const response = await request<AdminUser>(
        `/admin/users/${userId}`,
        { signal },
      )

      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminUserSessions(
  userId: string,
  page: number,
  size = 10,
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: adminUserQueryKeys.sessionPage(
      userId,
      page,
      size,
    ),
    queryFn: async ({ signal }) => {
      const parameters = new URLSearchParams({
        page: String(page),
        size: String(size),
      })

      const response = await request<
        PageResponse<AdminUserSession>
      >(
        `/admin/users/${userId}/sessions?${parameters.toString()}`,
        { signal },
      )

      return response.data
    },
    enabled: Boolean(userId),
  })
}
