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
import ResetPasswordPage from './ResetPasswordPage'

vi.mock(
  '@/features/auth/api/authApi',
  () => ({
    authApi: {
      resetPassword:
        vi.fn(),
    },
  }),
)

const resetPasswordMock =
  vi.mocked(
    authApi.resetPassword,
  )

function renderPage(
  initialEntry =
    '/reset-password?token=reset-token',
) {
  const router =
    createMemoryRouter(
      [
        {
          path:
            '/reset-password',

          element:
            <ResetPasswordPage />,
        },
        {
          path: '/login',

          element:
            <h1>Sign in</h1>,
        },
        {
          path:
            '/forgot-password',

          element:
            <h1>
              Forgot password
            </h1>,
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

async function fillValidForm() {
  const user =
    userEvent.setup()

  await user.type(
    screen.getByLabelText(
      'New password',
    ),
    'StrongPassword1!',
  )

  await user.type(
    screen.getByLabelText(
      'Confirm new password',
    ),
    'StrongPassword1!',
  )

  return user
}

describe(
  'ResetPasswordPage',
  () => {
    beforeEach(() => {
      resetPasswordMock
        .mockReset()
    })

    it(
      'shows a recovery state when the reset token is missing',
      () => {
        renderPage(
          '/reset-password',
        )

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Reset link missing',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            'link',
            {
              name:
                'Request a new one',
            },
          ),
        ).toHaveAttribute(
          'href',
          '/forgot-password',
        )

        expect(
          resetPasswordMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'shows validation errors when submitted empty',
      async () => {
        const user =
          userEvent.setup()

        renderPage()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Password must contain at least 12 characters',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Confirm your new password',
          ),
        ).toBeInTheDocument()

        expect(
          resetPasswordMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'does not submit when the passwords do not match',
      async () => {
        const user =
          userEvent.setup()

        renderPage()

        await user.type(
          screen.getByLabelText(
            'New password',
          ),
          'StrongPassword1!',
        )

        await user.type(
          screen.getByLabelText(
            'Confirm new password',
          ),
          'DifferentPassword1!',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Passwords do not match',
          ),
        ).toBeInTheDocument()

        expect(
          resetPasswordMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'submits the reset token and new password',
      async () => {
        resetPasswordMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Password reset successfully',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        renderPage()

        const user =
          await fillValidForm()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              resetPasswordMock,
            ).toHaveBeenCalledWith({
              token:
                'reset-token',

              newPassword:
                'StrongPassword1!',
            })
          },
        )

        expect(
          resetPasswordMock,
        ).toHaveBeenCalledTimes(
          1,
        )
      },
    )

    it(
      'shows the successful reset state',
      async () => {
        resetPasswordMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Your password has been changed.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        renderPage()

        const user =
          await fillValidForm()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Reset successful',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Your password has been changed.',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            'button',
            {
              name:
                'Continue to sign in',
            },
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'navigates to sign in after a successful reset',
      async () => {
        resetPasswordMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Password reset successfully',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        renderPage()

        const user =
          await fillValidForm()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
            },
          ),
        )

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
      'maps backend password validation errors to the password field',
      async () => {
        resetPasswordMock
          .mockRejectedValue(
            new ApiClientError(
              'Validation failed',
              400,
              {
                newPassword:
                  'Password was used previously',
              },
            ),
          )

        renderPage()

        const user =
          await fillValidForm()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Password was used previously',
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'shows the API error when the reset token is invalid or expired',
      async () => {
        resetPasswordMock
          .mockRejectedValue(
            new ApiClientError(
              'Password reset link is invalid or expired',
              400,
            ),
          )

        renderPage()

        const user =
          await fillValidForm()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'Password reset link is invalid or expired',
        )
      },
    )

    it(
      'shows a friendly message when the backend cannot be reached',
      async () => {
        resetPasswordMock
          .mockRejectedValue(
            new ApiClientError(
              'Network error',
              0,
            ),
          )

        renderPage()

        const user =
          await fillValidForm()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Reset password',
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

    it(
      'allows both password fields to be revealed and hidden',
      async () => {
        const user =
          userEvent.setup()

        renderPage()

        const password =
          screen.getByLabelText(
            'New password',
          )

        const confirmation =
          screen.getByLabelText(
            'Confirm new password',
          )

        expect(
          password,
        ).toHaveAttribute(
          'type',
          'password',
        )

        expect(
          confirmation,
        ).toHaveAttribute(
          'type',
          'password',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Show new password',
            },
          ),
        )

        expect(
          password,
        ).toHaveAttribute(
          'type',
          'text',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Show confirmed password',
            },
          ),
        )

        expect(
          confirmation,
        ).toHaveAttribute(
          'type',
          'text',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Hide new password',
            },
          ),
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Hide confirmed password',
            },
          ),
        )

        expect(
          password,
        ).toHaveAttribute(
          'type',
          'password',
        )

        expect(
          confirmation,
        ).toHaveAttribute(
          'type',
          'password',
        )
      },
    )
  },
)