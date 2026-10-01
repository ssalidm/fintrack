import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import useAuthenticatedAvatarClient from './useAuthenticatedAvatarClient'
import {
  profileAvatarQueryKey,
} from './useProfileAvatar'

export function useUploadProfileAvatar() {
  const queryClient =
    useQueryClient()

  const avatarClient =
    useAuthenticatedAvatarClient()

  return useMutation({
    mutationFn: (
      file: File,
    ) =>
      avatarClient.upload(
        file,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          profileAvatarQueryKey,
      })
    },
  })
}

export function useDeleteProfileAvatar() {
  const queryClient =
    useQueryClient()

  const avatarClient =
    useAuthenticatedAvatarClient()

  return useMutation({
    mutationFn: () =>
      avatarClient.remove(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          profileAvatarQueryKey,
      })
    },
  })
}
