import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryRouter,
} from 'react-router'
import {
  RouterProvider,
} from 'react-router/dom'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { ApiClientError } from '@/api/ApiClientError'
import { authApi } from '@/features/auth/api/authApi'
import { useAuth } from '@/features/auth/context/useAuth'
import VerifyEmailChangePage from './VerifyEmailChangePage'

vi.mock(
  '@/features/auth/api/authApi',
  () => ({
    authApi: {
      confirmEmailChange:
        vi.fn(),
    },
  }),
)

vi.mock(
  '@/features/auth/context/useAuth',
  () => ({
    useAuth: vi.fn(),
  }),
)

const confirmEmailChangeMock =
  vi.mocked(
    authApi.confirmEmailChange,
  )

const logoutMock =
  vi.fn<
    () => Promise<void>
  >()

function renderPage(
  initialEntry =
    '/verify-email-change?token=email-change-token',
) {
  const router =
    createMemoryRouter(
      [
        {
          path:
            '/verify-email-change',

          element:
            <VerifyEmailChangePage />,
        },
        {
          path: '/login',
          element:
            <h1>Sign in</h1>,
        },
      ],
      {
        initialEntries: [
          initialEntry,
        ],
      },
    )

  render(
    <RouterProvider
      router={router}
    />,
  )

  return router
}

describe(
  'VerifyEmailChangePage',
  () => {
    beforeEach(() => {
      confirmEmailChangeMock
        .mockReset()

      logoutMock.mockReset()

      logoutMock
        .mockResolvedValue(
          undefined,
        )

      vi.mocked(
        useAuth,
      ).mockReturnValue({
        accessToken:
          'access-token',

        status:
          'authenticated',

        login:
          vi.fn(),

        googleLogin:
          vi.fn(),

        verifyMfa:
          vi.fn(),

        recoverMfa:
          vi.fn(),

        logout:
          logoutMock,

        refreshAccessToken:
          vi.fn(
            async () =>
              'access-token',
          ),
      })
    })

    it(
      'shows a recovery state when the confirmation token is missing',
      () => {
        renderPage(
          '/verify-email-change',
        )

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Confirmation link missing',
            },
          ),
        ).toBeInTheDocument()

        expect(
          confirmEmailChangeMock,
        ).not.toHaveBeenCalled()

        expect(
          logoutMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'confirms the email change and logs out the current session',
      async () => {
        confirmEmailChangeMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Email changed successfully.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        renderPage()

        await waitFor(
          () => {
            expect(
              confirmEmailChangeMock,
            ).toHaveBeenCalledWith({
              token:
                'email-change-token',
            })
          },
        )

        await waitFor(
          () => {
            expect(
              logoutMock,
            ).toHaveBeenCalledTimes(
              1,
            )
          },
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Your new email is ready',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            /Email changed successfully/i,
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'still completes successfully when local logout fails',
      async () => {
        confirmEmailChangeMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Email changed successfully.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        logoutMock
          .mockRejectedValue(
            new Error(
              'Logout failed',
            ),
          )

        renderPage()

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Your new email is ready',
            },
          ),
        ).toBeInTheDocument()

        expect(
          logoutMock,
        ).toHaveBeenCalledTimes(
          1,
        )
      },
    )

    it(
      'navigates to sign in after successful confirmation',
      async () => {
        confirmEmailChangeMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Email changed successfully.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        const user =
          userEvent.setup()

        renderPage()

        await user.click(
          await screen.findByRole(
            'button',
            {
              name:
                'Continue to sign in',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Sign in',
            },
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'shows the API error when the confirmation fails',
      async () => {
        confirmEmailChangeMock
          .mockRejectedValue(
            new ApiClientError(
              'Email change link is invalid or expired',
              400,
            ),
          )

        renderPage()

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Email change unsuccessful',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'Email change link is invalid or expired',
        )

        expect(
          logoutMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'shows a friendly message when the backend cannot be reached',
      async () => {
        confirmEmailChangeMock
          .mockRejectedValue(
            new ApiClientError(
              'Network error',
              0,
            ),
          )

        renderPage()

        expect(
          await screen.findByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'We couldn’t connect to Salif right now. Please try again in a moment.',
        )

        expect(
          logoutMock,
        ).not.toHaveBeenCalled()
      },
    )
  },
)