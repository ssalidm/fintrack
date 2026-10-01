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
import VerifyEmailPage from './VerifyEmailPage'

vi.mock(
  '@/features/auth/api/authApi',
  () => ({
    authApi: {
      verifyEmail: vi.fn(),
    },
  }),
)

const verifyEmailMock =
  vi.mocked(
    authApi.verifyEmail,
  )

function renderPage(
  initialEntry =
    '/verify-email?token=verification-token',
) {
  const router =
    createMemoryRouter(
      [
        {
          path: '/verify-email',
          element:
            <VerifyEmailPage />,
        },
        {
          path:
            '/resend-verification',
          element:
            <h1>
              Resend verification
            </h1>,
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
  'VerifyEmailPage',
  () => {
    beforeEach(() => {
      verifyEmailMock.mockReset()
    })

    it(
      'shows a recovery state when the verification token is missing',
      () => {
        renderPage(
          '/verify-email',
        )

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Verification link missing',
            },
          ),
        ).toBeInTheDocument()

        expect(
          verifyEmailMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'verifies the email using the token from the URL',
      async () => {
        verifyEmailMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Email verified successfully.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        renderPage()

        await waitFor(
          () => {
            expect(
              verifyEmailMock,
            ).toHaveBeenCalledWith({
              token:
                'verification-token',
            })
          },
        )

        expect(
          verifyEmailMock,
        ).toHaveBeenCalledTimes(
          1,
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Your email is verified',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Email verified successfully.',
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'navigates to sign in after successful verification',
      async () => {
        verifyEmailMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Email verified successfully.',
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
      'shows the API error when verification fails',
      async () => {
        verifyEmailMock
          .mockRejectedValue(
            new ApiClientError(
              'Verification link is invalid or expired',
              400,
            ),
          )

        renderPage()

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Verification unsuccessful',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'Verification link is invalid or expired',
        )
      },
    )

    it(
      'shows a friendly message when the backend cannot be reached',
      async () => {
        verifyEmailMock
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
      },
    )

    it(
      'allows the user to request a new verification link after failure',
      async () => {
        verifyEmailMock
          .mockRejectedValue(
            new ApiClientError(
              'Verification failed',
              400,
            ),
          )

        const user =
          userEvent.setup()

        renderPage()

        await user.click(
          await screen.findByRole(
            'button',
            {
              name:
                'Request a new link',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Resend verification',
            },
          ),
        ).toBeInTheDocument()
      },
    )
  },
)