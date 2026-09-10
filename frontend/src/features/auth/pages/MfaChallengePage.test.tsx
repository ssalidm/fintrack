import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryRouter,
  RouterProvider,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useAuth } from '../context/useAuth'
import MfaChallengePage from './MfaChallengePage'

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

const verifyMfaMock = vi.fn()
const recoverMfaMock = vi.fn()

function renderMfaPage(
  withChallenge = true,
) {
  const router = createMemoryRouter(
    [
      {
        path: '/login/mfa',
        element: (
          <MfaChallengePage />
        ),
      },
      {
        path: '/login',
        element: (
          <h1>Sign in page</h1>
        ),
      },
      {
        path: '/dashboard',
        element: <h1>Dashboard</h1>,
      },
    ],
    {
      initialEntries: [
        withChallenge
          ? {
              pathname:
                '/login/mfa',

              state: {
                challenge: {
                  challengeToken:
                    'challenge-token',

                  expiresAt:
                    '2026-09-09T20:00:00Z',
                },

                from: '/dashboard',
              },
            }
          : '/login/mfa',
      ],
    },
  )

  render(
    <RouterProvider router={router} />,
  )
}

describe('MfaChallengePage', () => {
  beforeEach(() => {
    verifyMfaMock.mockReset()
    recoverMfaMock.mockReset()

    verifyMfaMock.mockResolvedValue(
      undefined,
    )

    recoverMfaMock.mockResolvedValue(
      undefined,
    )

    vi.mocked(
      useAuth,
    ).mockReturnValue({
      accessToken: null,
      status: 'unauthenticated',

      login: vi.fn(),

      verifyMfa: verifyMfaMock,

      recoverMfa: recoverMfaMock,

      logout: vi.fn(),

      refreshAccessToken: vi.fn(),
    })
  })

  it(
    'returns to sign in when no challenge is available',
    async () => {
      renderMfaPage(false)

      expect(
        await screen.findByRole(
          'heading',
          {
            name: 'Sign in page',
          },
        ),
      ).toBeInTheDocument()
    },
  )

  it(
    'verifies an authenticator code and continues',
    async () => {
      const user = userEvent.setup()

      renderMfaPage()

      await user.type(
        screen.getByLabelText(
          'Authenticator code',
        ),
        '123456',
      )

      await user.click(
        screen.getByRole('button', {
          name:
            'Verify and continue',
        }),
      )

      await waitFor(() => {
        expect(
          verifyMfaMock,
        ).toHaveBeenCalledWith({
          challengeToken:
            'challenge-token',

          code: '123456',
        })
      })

      expect(
        await screen.findByRole(
          'heading',
          {
            name: 'Dashboard',
          },
        ),
      ).toBeInTheDocument()
    },
  )

  it(
    'allows login with a recovery code',
    async () => {
      const user = userEvent.setup()

      renderMfaPage()

      await user.click(
        screen.getByRole('button', {
          name:
            'Use a recovery code instead',
        }),
      )

      await user.type(
        screen.getByLabelText(
          'Recovery code',
        ),
        'recovery-code-123',
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Use recovery code',
        }),
      )

      await waitFor(() => {
        expect(
          recoverMfaMock,
        ).toHaveBeenCalledWith({
          challengeToken:
            'challenge-token',

          recoveryCode:
            'recovery-code-123',
        })
      })
    },
  )
})