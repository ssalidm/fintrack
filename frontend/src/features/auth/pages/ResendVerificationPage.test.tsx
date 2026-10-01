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
import ResendVerificationPage from './ResendVerificationPage'

const startCooldownMock =
  vi.fn()

vi.mock(
  '@/features/auth/api/authApi',
  () => ({
    authApi: {
      resendVerification:
        vi.fn(),
    },
  }),
)

vi.mock(
  '@/features/auth/hooks/useRequestCooldown',
  () => ({
    useRequestCooldown:
      vi.fn(() => ({
        isCoolingDown: false,
        remainingSeconds: 0,
        startCooldown:
          startCooldownMock,
      })),

    formatCooldown:
      vi.fn(() => '1:00'),
  }),
)

const resendVerificationMock =
  vi.mocked(
    authApi.resendVerification,
  )

function renderPage(
  initialEntry =
    '/resend-verification',
) {
  const router =
    createMemoryRouter(
      [
        {
          path:
            '/resend-verification',

          element:
            <ResendVerificationPage />,
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
  'ResendVerificationPage',
  () => {
    beforeEach(() => {
      resendVerificationMock
        .mockReset()

      startCooldownMock
        .mockReset()
    })

    it(
      'prefills the email from the query string',
      () => {
        renderPage(
          '/resend-verification?email=david%40example.com',
        )

        expect(
          screen.getByLabelText(
            'Email',
          ),
        ).toHaveValue(
          'david@example.com',
        )
      },
    )

    it(
      'shows validation when submitted without an email',
      async () => {
        const user =
          userEvent.setup()

        renderPage()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send verification email',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Email is required',
          ),
        ).toBeInTheDocument()

        expect(
          resendVerificationMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'submits the trimmed email and shows the confirmation state',
      async () => {
        resendVerificationMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Verification email sent.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        const user =
          userEvent.setup()

        renderPage()

        await user.type(
          screen.getByLabelText(
            'Email',
          ),
          'david@example.com',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send verification email',
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              resendVerificationMock,
            ).toHaveBeenCalledWith({
              email:
                'david@example.com',
            })
          },
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Check your email',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Verification email sent.',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'david@example.com',
          ),
        ).toBeInTheDocument()

        expect(
          startCooldownMock,
        ).toHaveBeenCalledTimes(
          1,
        )
      },
    )

    it(
      'allows another verification email to be requested from the confirmation state',
      async () => {
        resendVerificationMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Verification email sent.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        const user =
          userEvent.setup()

        renderPage()

        await user.type(
          screen.getByLabelText(
            'Email',
          ),
          'david@example.com',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send verification email',
            },
          ),
        )

        await user.click(
          await screen.findByRole(
            'button',
            {
              name:
                'Send another verification email',
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              resendVerificationMock,
            ).toHaveBeenCalledTimes(
              2,
            )
          },
        )

        expect(
          resendVerificationMock,
        ).toHaveBeenNthCalledWith(
          2,
          {
            email:
              'david@example.com',
          },
        )
      },
    )

    it(
      'maps backend validation errors to the email field',
      async () => {
        resendVerificationMock
          .mockRejectedValue(
            new ApiClientError(
              'Validation failed',
              400,
              {
                email:
                  'Email address is invalid',
              },
            ),
          )

        const user =
          userEvent.setup()

        renderPage()

        await user.type(
          screen.getByLabelText(
            'Email',
          ),
          'david@example.com',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send verification email',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Email address is invalid',
          ),
        ).toBeInTheDocument()

        expect(
          startCooldownMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'shows a friendly message when the backend cannot be reached',
      async () => {
        resendVerificationMock
          .mockRejectedValue(
            new ApiClientError(
              'Network error',
              0,
            ),
          )

        const user =
          userEvent.setup()

        renderPage()

        await user.type(
          screen.getByLabelText(
            'Email',
          ),
          'david@example.com',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send verification email',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'We couldn’t connect to Salif right now. Please try again in a moment.',
        )
      },
    )
  },
)