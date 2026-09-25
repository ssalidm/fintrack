import {
  useCallback,
  useEffect,
  useRef,
} from 'react'

import { ApiClientError } from '@/api/ApiClientError'
import { useAuth } from '@/features/auth/context/useAuth'
import {
  deleteProfileAvatar,
  fetchProfileAvatar,
  uploadProfileAvatar,
} from '@/features/profile/api/avatarClient'

export default function useAuthenticatedAvatarClient() {
  const {
    accessToken,
    refreshAccessToken,
  } = useAuth()

  const accessTokenRef =
    useRef(accessToken)

  useEffect(() => {
    accessTokenRef.current =
      accessToken
  }, [accessToken])

  const withAuthentication =
    useCallback(
      async <T,>(
        request: (
          token: string,
        ) => Promise<T>,
      ): Promise<T> => {
        const currentToken =
          accessTokenRef.current

        if (!currentToken) {
          throw new Error(
            'Authenticated avatar request attempted without an access token',
          )
        }

        try {
          return await request(
            currentToken,
          )
        } catch (error) {
          if (
            !(
              error instanceof
              ApiClientError
            ) ||
            error.status !== 401
          ) {
            throw error
          }

          const refreshedToken =
            await refreshAccessToken()

          if (!refreshedToken) {
            throw error
          }

          accessTokenRef.current =
            refreshedToken

          return request(
            refreshedToken,
          )
        }
      },
      [refreshAccessToken],
    )

  const load =
    useCallback(
      (
        signal?: AbortSignal,
      ) =>
        withAuthentication(
          (token) =>
            fetchProfileAvatar(
              token,
              signal,
            ),
        ),
      [withAuthentication],
    )

  const upload =
    useCallback(
      (file: File) =>
        withAuthentication(
          (token) =>
            uploadProfileAvatar(
              token,
              file,
            ),
        ),
      [withAuthentication],
    )

  const remove =
    useCallback(
      () =>
        withAuthentication(
          (token) =>
            deleteProfileAvatar(
              token,
            ),
        ),
      [withAuthentication],
    )

  return {
    load,
    upload,
    remove,
  }
}
