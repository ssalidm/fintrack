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
import ForgotPasswordPage from './ForgotPasswordPage'

const startCooldownMock =
  vi.fn()

vi.mock(
  '@/features/auth/api/authApi',
  () => ({
    authApi: {
      forgotPassword:
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

const forgotPasswordMock =
  vi.mocked(
    authApi.forgotPassword,
  )

function renderPage() {
  const router =
    createMemoryRouter(
      [
        {
          path:
            '/forgot-password',

          element:
            <ForgotPasswordPage />,
        },
        {
          path: '/login',

          element:
            <h1>Sign in</h1>,
        },
      ],
      {
        initialEntries: [
          '/forgot-password',
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
  'ForgotPasswordPage',
  () => {
    beforeEach(() => {
      forgotPasswordMock
        .mockReset()

      startCooldownMock
        .mockReset()
    })

    it(
      'shows a validation error when submitted without an email',
      async () => {
        const user =
          userEvent.setup()

        renderPage()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send reset instructions',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Email is required',
          ),
        ).toBeInTheDocument()

        expect(
          forgotPasswordMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'shows a validation error for an invalid email address',
      async () => {
        const user =
          userEvent.setup()

        renderPage()

        await user.type(
          screen.getByLabelText(
            'Email',
          ),
          'not-an-email',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send reset instructions',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Enter a valid email address',
          ),
        ).toBeInTheDocument()

        expect(
          forgotPasswordMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'submits the trimmed email and shows the confirmation state',
      async () => {
        forgotPasswordMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Password reset instructions sent.',
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
          '  david@example.com  ',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send reset instructions',
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              forgotPasswordMock,
            ).toHaveBeenCalledWith({
              email:
                'david@example.com',
            })
          },
        )

        expect(
          forgotPasswordMock,
        ).toHaveBeenCalledTimes(
          1,
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Check your inbox',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'david@example.com',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Password reset instructions sent.',
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
      'can send another reset email from the confirmation state',
      async () => {
        forgotPasswordMock
          .mockResolvedValue({
            data: undefined,
            status: 200,
            message:
              'Password reset instructions sent.',
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
                'Send reset instructions',
            },
          ),
        )

        const resendButton =
          await screen.findByRole(
            'button',
            {
              name:
                'Send another reset email',
            },
          )

        await user.click(
          resendButton,
        )

        await waitFor(
          () => {
            expect(
              forgotPasswordMock,
            ).toHaveBeenCalledTimes(
              2,
            )
          },
        )

        expect(
          forgotPasswordMock,
        ).toHaveBeenNthCalledWith(
          2,
          {
            email:
              'david@example.com',
          },
        )

        expect(
          startCooldownMock,
        ).toHaveBeenCalledTimes(
          2,
        )
      },
    )

    it(
      'maps backend email validation errors to the email field',
      async () => {
        forgotPasswordMock
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
                'Send reset instructions',
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
      'shows the API error when the reset request fails',
      async () => {
        forgotPasswordMock
          .mockRejectedValue(
            new ApiClientError(
              'Password reset request could not be completed',
              400,
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
                'Send reset instructions',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'Password reset request could not be completed',
        )

        expect(
          startCooldownMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'shows a friendly message when the backend cannot be reached',
      async () => {
        forgotPasswordMock
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
                'Send reset instructions',
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

        expect(
          startCooldownMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'links back to the sign-in page',
      () => {
        renderPage()

        expect(
          screen.getByRole(
            'link',
            {
              name:
                'Return to sign in',
            },
          ),
        ).toHaveAttribute(
          'href',
          '/login',
        )
      },
    )
  },
)