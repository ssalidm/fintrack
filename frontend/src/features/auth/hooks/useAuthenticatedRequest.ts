import {useCallback, useEffect, useRef} from 'react'
import {ApiClientError} from '../../../api/ApiClientError'
import {apiRequest, type ApiRequestOptions} from '../../../api/client'
import type {ApiResult} from '../../../api/types'
import {useAuth} from '../context/useAuth'

type AuthenticatedRequestOptions = Omit<
  ApiRequestOptions,
  'accessToken'
>

export function useAuthenticatedRequest() {
  const {
    accessToken,
    refreshAccessToken,
  } = useAuth()

  const accessTokenRef = useRef(accessToken)

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  return useCallback(
    async <T, >(
      path: string,
      options: AuthenticatedRequestOptions = {},
    ): Promise<ApiResult<T>> => {
      const currentToken = accessTokenRef.current

      if (!currentToken) {
        throw new Error(
          'Authenticated request attempted without an access token',
        )
      }

      try {
        return await apiRequest<T>(path, {
          ...options,
          accessToken: currentToken,
        })
      } catch (error) {
        if (
          !(error instanceof ApiClientError) ||
          error.status !== 401
        ) {
          throw error
        }

        const refreshedToken = await refreshAccessToken()

        if (!refreshedToken) {
          throw error
        }

        return apiRequest<T>(path, {
          ...options,
          accessToken: refreshedToken,
        })
      }
    },
    [refreshAccessToken],
  )
}
