import {useQuery} from '@tanstack/react-query'
import {useAuthenticatedRequest} from '@/features/auth/hooks/useAuthenticatedRequest'
import type {UserProfile} from '@/features/profile/api/types'

export const profileQueryKey = ['profile'] as const

export function useProfile() {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async ({signal}) => {
      const response = await request<UserProfile>('/profile', {
        signal,
      })

      return response.data
    },
  })
}
