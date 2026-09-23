import { useQuery } from '@tanstack/react-query'

import useAuthenticatedAvatarClient from './useAuthenticatedAvatarClient'

export const profileAvatarQueryKey =
  ['profile', 'avatar'] as const

export function useProfileAvatar() {
  const avatarClient =
    useAuthenticatedAvatarClient()

  return useQuery({
    queryKey:
      profileAvatarQueryKey,
    queryFn: ({ signal }) =>
      avatarClient.load(
        signal,
      ),
    staleTime: 5 * 60 * 1000,
  })
}
