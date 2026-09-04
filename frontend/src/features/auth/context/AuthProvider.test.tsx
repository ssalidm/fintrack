import {StrictMode} from 'react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {authApi} from '../api/authApi'
import AuthProvider from './AuthProvider'
import {useAuth} from './useAuth'

vi.mock('../api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  },
}))

const loginMock = vi.mocked(authApi.login)
const refreshMock = vi.mocked(authApi.refresh)
const logoutMock = vi.mocked(authApi.logout)

const REFRESH_TOKEN_KEY = 'salif.auth.refreshToken'

function tokenResponse(accessToken: string, refreshToken: string) {
  return {
    data: {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    },
    status: 200,
    message: 'Authentication successful',
    timestamp: '2026-09-03T12:00:00Z',
  }
}

function AuthProbe() {
  const {
    accessToken,
    status,
    login,
    logout,
    refreshAccessToken,
  } = useAuth()

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="access-token">{accessToken ?? 'none'}</p>

      <button
        type="button"
        onClick={() =>
          void login({
            email: 'david@example.com',
            password: 'ExistingPassword1!',
          })
        }
      >
        Log in
      </button>

      <button
        type="button"
        onClick={() => void logout()}
      >
        Log out
      </button>

      <button
        type="button"
        onClick={() =>
          void Promise.all([
            refreshAccessToken(),
            refreshAccessToken(),
          ])
        }
      >
        Refresh twice
      </button>
    </div>
  )
}

function renderProvider(strict = false) {
  const content = (
    <AuthProvider>
      <AuthProbe/>
    </AuthProvider>
  )

  render(strict ? <StrictMode>{content}</StrictMode> : content)
}

describe('AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear()
    loginMock.mockReset()
    refreshMock.mockReset()
    logoutMock.mockReset()
  })

  it('starts unauthenticated when no refresh token exists', async () => {
    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'unauthenticated',
      )
    })

    expect(screen.getByTestId('access-token')).toHaveTextContent(
      'none',
    )
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('stores the access token in memory and refresh token in session storage', async () => {
    const user = userEvent.setup()

    loginMock.mockResolvedValue(
      tokenResponse('access-token-1', 'refresh-token-1'),
    )

    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'unauthenticated',
      )
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Log in',
      }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'authenticated',
      )
    })

    expect(loginMock).toHaveBeenCalledWith({
      email: 'david@example.com',
      password: 'ExistingPassword1!',
    })

    expect(screen.getByTestId('access-token')).toHaveTextContent(
      'access-token-1',
    )

    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe(
      'refresh-token-1',
    )

    // Only the refresh token should be persisted.
    expect(sessionStorage).toHaveLength(1)
  })

  it('restores and rotates the session only once under StrictMode', async () => {
    sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      'old-refresh-token',
    )

    refreshMock.mockResolvedValue(
      tokenResponse('restored-access-token', 'new-refresh-token'),
    )

    renderProvider(true)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'authenticated',
      )
    })

    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(refreshMock).toHaveBeenCalledWith({
      refreshToken: 'old-refresh-token',
    })

    expect(screen.getByTestId('access-token')).toHaveTextContent(
      'restored-access-token',
    )

    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe(
      'new-refresh-token',
    )
  })

  it('clears the session when restoration fails', async () => {
    sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      'expired-refresh-token',
    )

    refreshMock.mockRejectedValue(
      new Error('Refresh token expired'),
    )

    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'unauthenticated',
      )
    })

    expect(screen.getByTestId('access-token')).toHaveTextContent(
      'none',
    )

    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })

  it('logs out using the access token and clears the session', async () => {
    const user = userEvent.setup()

    loginMock.mockResolvedValue(
      tokenResponse('access-token-1', 'refresh-token-1'),
    )

    logoutMock.mockResolvedValue({
      data: undefined,
      status: 200,
      message: 'Logout successful',
      timestamp: '2026-09-03T12:00:00Z',
    })

    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'unauthenticated',
      )
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Log in',
      }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'authenticated',
      )
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Log out',
      }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'unauthenticated',
      )
    })

    expect(logoutMock).toHaveBeenCalledWith('access-token-1')
    expect(screen.getByTestId('access-token')).toHaveTextContent(
      'none',
    )
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })

  it('shares one backend request between concurrent refreshes', async () => {
    const user = userEvent.setup()

    sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      'original-refresh-token',
    )

    refreshMock
      .mockResolvedValueOnce(
        tokenResponse(
          'initial-access-token',
          'refresh-token-after-restore',
        ),
      )
      .mockResolvedValueOnce(
        tokenResponse(
          'renewed-access-token',
          'refresh-token-after-renewal',
        ),
      )

    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent(
        'authenticated',
      )
    })

    // Ignore the initial session-restoration call.
    refreshMock.mockClear()

    await user.click(
      screen.getByRole('button', {
        name: 'Refresh twice',
      }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('access-token')).toHaveTextContent(
        'renewed-access-token',
      )
    })

    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(refreshMock).toHaveBeenCalledWith({
      refreshToken: 'refresh-token-after-restore',
    })

    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe(
      'refresh-token-after-renewal',
    )
  })
})
