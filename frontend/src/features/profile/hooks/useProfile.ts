import {useQuery} from '@tanstack/react-query'
import {useAuthenticatedRequest} from '../../auth/hooks/useAuthenticatedRequest'
import type {UserProfile} from '../api/types'

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
