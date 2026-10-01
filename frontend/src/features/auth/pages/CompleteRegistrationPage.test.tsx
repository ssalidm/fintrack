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
import CompleteRegistrationPage from './CompleteRegistrationPage'

vi.mock(
  '@/features/auth/api/authApi',
  () => ({
    authApi: {
      completeRegistration:
        vi.fn(),
    },
  }),
)

const completeRegistrationMock =
  vi.mocked(
    authApi.completeRegistration,
  )

function renderPage(
  initialEntry =
    '/register/complete?token=registration-token',
) {
  const router =
    createMemoryRouter(
      [
        {
          path:
            '/register/complete',

          element:
            <CompleteRegistrationPage />,
        },
        {
          path: '/login',

          element:
            <h1>Sign in</h1>,
        },
        {
          path: '/register',

          element:
            <h1>Register</h1>,
        },
        {
          path: '/terms',

          element:
            <h1>Terms</h1>,
        },
        {
          path: '/privacy',

          element:
            <h1>Privacy</h1>,
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
      'First name',
    ),
    'David',
  )

  await user.type(
    screen.getByLabelText(
      'Last name',
    ),
    'Ssali',
  )

  await user.type(
    screen.getByRole(
      'textbox',
      {
        name: /preferred name/i,
      },
    ),
    'Dave',
  )

  await user.type(
    screen.getByLabelText(
      'Password',
    ),
    'StrongPassword1!',
  )

  await user.type(
    screen.getByLabelText(
      'Confirm password',
    ),
    'StrongPassword1!',
  )

  await user.click(
    screen.getByRole(
      'checkbox',
      {
        name:
          /I agree to Salif’s/i,
      },
    ),
  )

  return user
}

describe(
  'CompleteRegistrationPage',
  () => {
    beforeEach(() => {
      completeRegistrationMock
        .mockReset()
    })

    it(
      'shows a recovery state when the registration token is missing',
      () => {
        renderPage(
          '/register/complete',
        )

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Registration link missing',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            'link',
            {
              name:
                'Start registration again',
            },
          ),
        ).toHaveAttribute(
          'href',
          '/register',
        )

        expect(
          completeRegistrationMock,
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
                'Create account',
            },
          ),
        )

        expect(
          await screen.findAllByText(
            'This field is required',
          ),
        ).toHaveLength(2)

        expect(
          screen.getByText(
            'Password must contain at least 12 characters',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Confirm your password',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'You must accept the Terms and Privacy Policy',
          ),
        ).toBeInTheDocument()

        expect(
          completeRegistrationMock,
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
            'First name',
          ),
          'David',
        )

        await user.type(
          screen.getByLabelText(
            'Last name',
          ),
          'Ssali',
        )

        await user.type(
          screen.getByLabelText(
            'Password',
          ),
          'StrongPassword1!',
        )

        await user.type(
          screen.getByLabelText(
            'Confirm password',
          ),
          'DifferentPassword1!',
        )

        await user.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                /I agree to Salif’s/i,
            },
          ),
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Create account',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Passwords do not match',
          ),
        ).toBeInTheDocument()

        expect(
          completeRegistrationMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'submits the exact registration payload',
      async () => {
        completeRegistrationMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Registration completed',
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
                'Create account',
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              completeRegistrationMock,
            ).toHaveBeenCalledWith({
              token:
                'registration-token',

              firstName:
                'David',

              lastName:
                'Ssali',

              preferredName:
                'Dave',

              password:
                'StrongPassword1!',

              acceptTerms:
                true,
            })
          },
        )

        expect(
          completeRegistrationMock,
        ).toHaveBeenCalledTimes(
          1,
        )
      },
    )

    it(
      'omits preferredName when the field is blank',
      async () => {
        completeRegistrationMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Registration completed',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        renderPage()

        const user =
          userEvent.setup()

        await user.type(
          screen.getByLabelText(
            'First name',
          ),
          'David',
        )

        await user.type(
          screen.getByLabelText(
            'Last name',
          ),
          'Ssali',
        )

        await user.type(
          screen.getByLabelText(
            'Password',
          ),
          'StrongPassword1!',
        )

        await user.type(
          screen.getByLabelText(
            'Confirm password',
          ),
          'StrongPassword1!',
        )

        await user.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                /I agree to Salif’s/i,
            },
          ),
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Create account',
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              completeRegistrationMock,
            ).toHaveBeenCalledWith({
              token:
                'registration-token',

              firstName:
                'David',

              lastName:
                'Ssali',

              preferredName:
                undefined,

              password:
                'StrongPassword1!',

              acceptTerms:
                true,
            })
          },
        )
      },
    )

    it(
      'shows the completion state after successful registration',
      async () => {
        completeRegistrationMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Registration completed',
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
                'Create account',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Your account is ready',
            },
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
      'navigates to sign in from the successful completion state',
      async () => {
        completeRegistrationMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Registration completed',
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
                'Create account',
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
      'maps server validation errors back to the form',
      async () => {
        completeRegistrationMock
          .mockRejectedValue(
            new ApiClientError(
              'Validation failed',
              400,
              {
                firstName:
                  'First name is invalid',

                preferredName:
                  'Preferred name is invalid',
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
                'Create account',
            },
          ),
        )

        expect(
          await screen.findByText(
            'First name is invalid',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Preferred name is invalid',
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'shows the API error when the registration token is invalid',
      async () => {
        completeRegistrationMock
          .mockRejectedValue(
            new ApiClientError(
              'Registration link is invalid or expired',
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
                'Create account',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'alert',
          ),
        ).toHaveTextContent(
          'Registration link is invalid or expired',
        )
      },
    )

    it(
      'shows a friendly message when the backend cannot be reached',
      async () => {
        completeRegistrationMock
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
                'Create account',
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