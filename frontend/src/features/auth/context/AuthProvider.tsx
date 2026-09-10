import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { ApiClientError } from '../../../api/ApiClientError'
import { queryClient } from '../../../api/queryClient'
import { authApi } from '../api/authApi'
import type {
  LoginRequest,
  MfaRecoverRequest,
  MfaVerifyRequest,
  TokenResponse,
} from '../api/types'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from './AuthContext'

const REFRESH_TOKEN_KEY =
  'salif.auth.refreshToken'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const [accessToken, setAccessToken] =
    useState<string | null>(null)

  const [status, setStatus] =
    useState<AuthStatus>('checking')

  const hasRestoredSession = useRef(false)

  const refreshPromise =
    useRef<Promise<string | null> | null>(
      null,
    )

  const sessionVersion = useRef(0)

  const establishSession = useCallback(
    (tokens: TokenResponse) => {
      setAccessToken(tokens.accessToken)

      sessionStorage.setItem(
        REFRESH_TOKEN_KEY,
        tokens.refreshToken,
      )

      setStatus('authenticated')
    },
    [],
  )

  const clearSession = useCallback(() => {
    sessionVersion.current += 1

    setAccessToken(null)

    sessionStorage.removeItem(
      REFRESH_TOKEN_KEY,
    )

    queryClient.clear()

    setStatus('unauthenticated')
  }, [])

  const login = useCallback(
    async (request: LoginRequest) => {
      const response =
        await authApi.login(request)

      if (
        response.data.status ===
        'AUTHENTICATED'
      ) {
        if (!response.data.tokens) {
          throw new ApiClientError(
            'The server returned an invalid login response.',
            response.status,
          )
        }

        /*
         * Invalidate any older refresh
         * operation before establishing
         * the new session.
         */
        sessionVersion.current += 1

        establishSession(
          response.data.tokens,
        )
      }

      /*
       * MFA_REQUIRED is returned without
       * creating a frontend session.
       * LoginPage will use the challenge
       * to continue authentication.
       */
      return response.data
    },
    [establishSession],
  )

  const verifyMfa = useCallback(
    async (request: MfaVerifyRequest) => {
      const response =
        await authApi.verifyMfa(request)

      sessionVersion.current += 1

      establishSession(response.data)
    },
    [establishSession],
  )

  const recoverMfa = useCallback(
    async (request: MfaRecoverRequest) => {
      const response =
        await authApi.recoverMfa(request)

      sessionVersion.current += 1

      establishSession(response.data)
    },
    [establishSession],
  )

  const refreshAccessToken =
    useCallback((): Promise<
      string | null
    > => {
      if (refreshPromise.current) {
        return refreshPromise.current
      }

      const storedRefreshToken =
        sessionStorage.getItem(
          REFRESH_TOKEN_KEY,
        )

      if (!storedRefreshToken) {
        clearSession()

        return Promise.resolve(null)
      }

      const versionAtStart =
        sessionVersion.current

      const request = authApi
        .refresh({
          refreshToken:
            storedRefreshToken,
        })
        .then((response) => {
          /*
           * Ignore a refresh response if
           * logout or login happened while
           * the request was in progress.
           */
          if (
            versionAtStart !==
            sessionVersion.current
          ) {
            return null
          }

          establishSession(response.data)

          return response.data.accessToken
        })
        .catch(() => {
          if (
            versionAtStart ===
            sessionVersion.current
          ) {
            clearSession()
          }

          return null
        })
        .finally(() => {
          refreshPromise.current = null
        })

      refreshPromise.current = request

      return request
    }, [
      clearSession,
      establishSession,
    ])

  const logout = useCallback(async () => {
    const tokenToRevoke = accessToken

    /*
     * Clear immediately and invalidate
     * any in-flight refresh request.
     */
    clearSession()

    if (!tokenToRevoke) {
      return
    }

    try {
      await authApi.logout(tokenToRevoke)
    } catch {
      /*
       * Local logout remains successful
       * if the backend is unreachable.
       */
    }
  }, [accessToken, clearSession])

  useEffect(() => {
    if (hasRestoredSession.current) {
      return
    }

    hasRestoredSession.current = true

    void refreshAccessToken()
  }, [refreshAccessToken])

  const value =
    useMemo<AuthContextValue>(
      () => ({
        accessToken,
        status,
        login,
        verifyMfa,
        recoverMfa,
        logout,
        refreshAccessToken,
      }),
      [
        accessToken,
        status,
        login,
        verifyMfa,
        recoverMfa,
        logout,
        refreshAccessToken,
      ],
    )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}