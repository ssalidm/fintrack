import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {authApi} from '../api/authApi'
import type {LoginRequest, TokenResponse} from '../api/types'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from './AuthContext'

const REFRESH_TOKEN_KEY = 'salif.auth.refreshToken'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({children}: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')

  const hasRestoredSession = useRef(false)
  const refreshPromise = useRef<Promise<string | null> | null>(null)
  const sessionVersion = useRef(0)

  const establishSession = useCallback((tokens: TokenResponse) => {
    setAccessToken(tokens.accessToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    setStatus('authenticated')
  }, [])

  const clearSession = useCallback(() => {
    sessionVersion.current += 1
    setAccessToken(null)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    setStatus('unauthenticated')
  }, [])

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await authApi.login(request)

      // Invalidate any older refresh operation.
      sessionVersion.current += 1
      establishSession(response.data)
    },
    [establishSession],
  )

  const refreshAccessToken = useCallback((): Promise<string | null> => {
    if (refreshPromise.current) {
      return refreshPromise.current
    }

    const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)

    if (!storedRefreshToken) {
      clearSession()
      return Promise.resolve(null)
    }

    const versionAtStart = sessionVersion.current

    const request = authApi
      .refresh({
        refreshToken: storedRefreshToken,
      })
      .then((response) => {
        // Ignore a refresh response if logout or login happened meanwhile.
        if (versionAtStart !== sessionVersion.current) {
          return null
        }

        establishSession(response.data)
        return response.data.accessToken
      })
      .catch(() => {
        if (versionAtStart === sessionVersion.current) {
          clearSession()
        }

        return null
      })
      .finally(() => {
        refreshPromise.current = null
      })

    refreshPromise.current = request

    return request
  }, [clearSession, establishSession])

  const logout = useCallback(async () => {
    const tokenToRevoke = accessToken

    // Clear immediately and invalidate any in-flight refresh.
    clearSession()

    if (!tokenToRevoke) {
      return
    }

    try {
      await authApi.logout(tokenToRevoke)
    } catch {
      // Local logout remains successful if the server is unreachable.
    }
  }, [accessToken, clearSession])

  useEffect(() => {
    if (hasRestoredSession.current) {
      return
    }

    hasRestoredSession.current = true
    void refreshAccessToken()
  }, [refreshAccessToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      status,
      login,
      logout,
      refreshAccessToken,
    }),
    [
      accessToken,
      status,
      login,
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
