import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { ApiClientError } from '@/api/ApiClientError'
import { queryClient } from '@/api/queryClient'
import { authApi } from '@/features/auth/api/authApi'
import type {
  GoogleLoginRequest,
  LoginRequest,
  MfaRecoverRequest,
  MfaVerifyRequest,
  TokenResponse,
} from '@/features/auth/api/types'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from './AuthContext'
import { disableGoogleAutoSelect } from '@/features/auth/utils/googleIdentity'


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
    useState<AuthStatus>(
      'checking',
    )

  const hasRestoredSession =
    useRef(false)

  const refreshPromise =
    useRef<
      Promise<
        string | null
      > | null
    >(null)

  const sessionVersion =
    useRef(0)

  /*
   * Kept in memory only.
   *
   * If Google tells us that an existing
   * account must be linked, the credential
   * survives normal password login and MFA
   * without being stored in browser storage.
   */
  const pendingGoogleCredential =
    useRef<string | null>(
      null,
    )

  const establishSession =
    useCallback(
      (
        tokens: TokenResponse,
      ) => {
        setAccessToken(
          tokens.accessToken,
        )

        sessionStorage.setItem(
          REFRESH_TOKEN_KEY,
          tokens.refreshToken,
        )

        setStatus(
          'authenticated',
        )
      },
      [],
    )

  const clearSession =
    useCallback(() => {
      sessionVersion.current += 1

      pendingGoogleCredential.current =
        null

      setAccessToken(null)

      sessionStorage.removeItem(
        REFRESH_TOKEN_KEY,
      )

      queryClient.clear()

      setStatus(
        'unauthenticated',
      )
    }, [])

  const completeAuthentication =
    useCallback(
      async (
        tokens: TokenResponse,
      ) => {
        const pendingCredential =
          pendingGoogleCredential.current

        if (pendingCredential) {
          try {
            await authApi.linkGoogle(
              {
                credential:
                  pendingCredential,
              },
              tokens.accessToken,
            )

            pendingGoogleCredential.current =
              null
          } catch (error) {
            /*
             * Authentication succeeded on
             * the backend, but linking did
             * not.
             *
             * Revoke the newly-created
             * session rather than leaving
             * an untracked active session.
             */
            pendingGoogleCredential.current =
              null

            try {
              await authApi.logout(
                tokens.accessToken,
              )
            } catch {
              /*
               * Best-effort cleanup.
               *
               * The frontend never stores
               * the failed session tokens.
               */
            }

            throw error
          }
        }

        sessionVersion.current += 1

        establishSession(
          tokens,
        )
      },
      [establishSession],
    )

  const login =
    useCallback(
      async (
        request: LoginRequest,
      ) => {
        const response =
          await authApi.login(
            request,
          )

        if (
          response.data.status ===
          'AUTHENTICATED'
        ) {
          if (
            !response.data.tokens
          ) {
            throw new ApiClientError(
              'The server returned an invalid login response.',
              response.status,
            )
          }

          await completeAuthentication(
            response.data.tokens,
          )
        }

        return response.data
      },
      [
        completeAuthentication,
      ],
    )

  const googleLogin =
    useCallback(
      async (
        request:
          GoogleLoginRequest,
      ) => {
        /*
         * A new Google attempt replaces
         * any previous unfinished linking
         * attempt.
         */
        pendingGoogleCredential.current =
          null

        const response =
          await authApi.googleLogin(
            request,
          )

        if (
          response.data.status ===
          'AUTHENTICATED'
        ) {
          if (
            !response.data.tokens
          ) {
            throw new ApiClientError(
              'The server returned an invalid Google login response.',
              response.status,
            )
          }

          await completeAuthentication(
            response.data.tokens,
          )
        }

        if (
          response.data.status ===
          'ACCOUNT_LINK_REQUIRED'
        ) {
          pendingGoogleCredential.current =
            request.credential
        }

        return response.data
      },
      [
        completeAuthentication,
      ],
    )

  const verifyMfa =
    useCallback(
      async (
        request:
          MfaVerifyRequest,
      ) => {
        const response =
          await authApi.verifyMfa(
            request,
          )

        await completeAuthentication(
          response.data,
        )
      },
      [
        completeAuthentication,
      ],
    )

  const recoverMfa =
    useCallback(
      async (
        request:
          MfaRecoverRequest,
      ) => {
        const response =
          await authApi.recoverMfa(
            request,
          )

        await completeAuthentication(
          response.data,
        )
      },
      [
        completeAuthentication,
      ],
    )

  const refreshAccessToken =
    useCallback(
      (): Promise<
        string | null
      > => {
        if (
          refreshPromise.current
        ) {
          return refreshPromise.current
        }

        const storedRefreshToken =
          sessionStorage.getItem(
            REFRESH_TOKEN_KEY,
          )

        if (
          !storedRefreshToken
        ) {
          clearSession()

          return Promise.resolve(
            null,
          )
        }

        const versionAtStart =
          sessionVersion.current

        const request =
          authApi
            .refresh({
              refreshToken:
                storedRefreshToken,
            })
            .then(
              (response) => {
                if (
                  versionAtStart !==
                  sessionVersion.current
                ) {
                  return null
                }

                establishSession(
                  response.data,
                )

                return response
                  .data
                  .accessToken
              },
            )
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
              refreshPromise.current =
                null
            })

        refreshPromise.current =
          request

        return request
      },
      [
        clearSession,
        establishSession,
      ],
    )

  const logout =
    useCallback(
      async () => {
        const tokenToRevoke =
          accessToken

        /*
       * Record that the user deliberately
       * signed out of Salif.
       *
       * This does not sign them out of
       * their Google account.
       */
        disableGoogleAutoSelect()

        clearSession()

        if (!tokenToRevoke) {
          return
        }

        try {
          await authApi.logout(
            tokenToRevoke,
          )
        } catch {
          /*
           * Local logout remains successful
           * if the backend cannot be reached.
           */
        }
      },
      [
        accessToken,
        clearSession,
      ],
    )

  useEffect(() => {
    if (
      hasRestoredSession.current
    ) {
      return
    }

    hasRestoredSession.current =
      true

    void refreshAccessToken()
  }, [
    refreshAccessToken,
  ])

  const value =
    useMemo<AuthContextValue>(
      () => ({
        accessToken,
        status,
        login,
        googleLogin,
        verifyMfa,
        recoverMfa,
        logout,
        refreshAccessToken,
      }),
      [
        accessToken,
        status,
        login,
        googleLogin,
        verifyMfa,
        recoverMfa,
        logout,
        refreshAccessToken,
      ],
    )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}