import type {
  ComponentType,
} from 'react'
import {
  fireEvent,
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
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { ApiClientError } from '@/api/ApiClientError'
import { supportApi } from '@/features/support/api/supportApi'

vi.mock(
  '@/features/support/api/supportApi',
  () => ({
    supportTopics: [
      {
        value: 'SECURITY',
        label:
          'Account security or an unexpected email',
      },
      {
        value: 'ACCOUNT_ACCESS',
        label:
          'Signing in, passwords or email verification',
      },
      {
        value: 'TECHNICAL_ISSUE',
        label:
          'Something is not working',
      },
      {
        value: 'DATA_PRIVACY',
        label:
          'My data or privacy',
      },
      {
        value: 'FEEDBACK',
        label:
          'Feedback or a suggestion',
      },
      {
        value: 'GENERAL',
        label:
          'Something else',
      },
    ],

    supportApi: {
      contact: vi.fn(),
    },
  }),
)

vi.mock(
  '@/features/support/components/SupportVerification',
  () => ({
    default: ({
      onTokenChange,
    }: {
      onTokenChange:
        (token: string) => void
    }) => (
      <button
        type="button"
        onClick={() =>
          onTokenChange(
            'turnstile-test-token',
          )
        }
      >
        Complete security check
      </button>
    ),
  }),
)

vi.mock(
  '@/components/layout/PublicNavbar',
  () => ({
    default: () => (
      <nav>
        Public navbar
      </nav>
    ),
  }),
)

vi.mock(
  '@/components/layout/PublicFooter',
  () => ({
    default: () => (
      <footer>
        Public footer
      </footer>
    ),
  }),
)

const contactMock =
  vi.mocked(
    supportApi.contact,
  )

let SupportPage:
  ComponentType

function renderPage() {
  const router =
    createMemoryRouter(
      [
        {
          path: '/support',
          element:
            <SupportPage />,
        },
        {
          path:
            '/forgot-password',
          element:
            <h1>
              Forgot password
            </h1>,
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
          path: '/profile',
          element:
            <h1>Profile</h1>,
        },
      ],
      {
        initialEntries: [
          '/support',
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

async function completeSecurityCheck() {
  const user =
    userEvent.setup()

  await user.click(
    screen.getByRole(
      'button',
      {
        name:
          'Complete security check',
      },
    ),
  )

  return user
}

async function fillValidForm() {
  const user =
    userEvent.setup()

  await user.type(
    screen.getByLabelText(
      'Name',
    ),
    'David Ssali',
  )

  await user.type(
    screen.getByLabelText(
      'Email',
    ),
    'david@example.com',
  )

  await user.selectOptions(
    screen.getByLabelText(
      'Topic',
    ),
    'TECHNICAL_ISSUE',
  )

  await user.type(
    screen.getByLabelText(
      'Message',
    ),
    'I cannot complete a transaction after signing in.',
  )

  await user.click(
    screen.getByRole(
      'button',
      {
        name:
          'Complete security check',
      },
    ),
  )

  return user
}

describe(
  'SupportPage',
  () => {
    beforeAll(
      async () => {
        vi.stubEnv(
          'VITE_TURNSTILE_SITE_KEY',
          'test-turnstile-site-key',
        )

        const module =
          await import(
            './SupportPage'
          )

        SupportPage =
          module.default
      },
    )

    afterAll(() => {
      vi.unstubAllEnvs()
    })

    beforeEach(() => {
      contactMock.mockReset()
    })

    it(
      'requires security verification before the form can be submitted',
      async () => {
        renderPage()

        const submitButton =
          screen.getByRole(
            'button',
            {
              name:
                'Send message',
            },
          )

        expect(
          submitButton,
        ).toBeDisabled()

        await completeSecurityCheck()

        expect(
          submitButton,
        ).toBeEnabled()

        expect(
          contactMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'shows client validation errors for invalid form values',
      () => {
        renderPage()

        const submitButton =
          screen.getByRole(
            'button',
            {
              name:
                'Send message',
            },
          )

        const form =
          submitButton.closest(
            'form',
          )

        expect(
          form,
        ).not.toBeNull()

        fireEvent.submit(
          form!,
        )

        expect(
          screen.getByText(
            'Enter a name between 2 and 100 characters.',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Enter a valid email address.',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Enter a message between 10 and 2,000 characters.',
          ),
        ).toBeInTheDocument()

        expect(
          contactMock,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'submits the trimmed support request with the verification token',
      async () => {
        contactMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Support request received.',
            timestamp:
              '2026-09-25T10:00:00Z',
          })

        const user =
          userEvent.setup()

        renderPage()

        await user.type(
          screen.getByLabelText(
            'Name',
          ),
          '  David Ssali  ',
        )

        await user.type(
          screen.getByLabelText(
            'Email',
          ),
          '  david@example.com  ',
        )

        await user.selectOptions(
          screen.getByLabelText(
            'Topic',
          ),
          'TECHNICAL_ISSUE',
        )

        await user.type(
          screen.getByLabelText(
            'Message',
          ),
          '  I cannot complete a transaction after signing in.  ',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Complete security check',
            },
          ),
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Send message',
            },
          ),
        )

        await waitFor(
          () => {
            expect(
              contactMock,
            ).toHaveBeenCalledWith({
              name:
                'David Ssali',

              email:
                'david@example.com',

              topic:
                'TECHNICAL_ISSUE',

              message:
                'I cannot complete a transaction after signing in.',

              website: '',

              turnstileToken:
                'turnstile-test-token',
            })
          },
        )

        expect(
          contactMock,
        ).toHaveBeenCalledTimes(
          1,
        )
      },
    )

    it(
      'shows the success state after a support request is accepted',
      async () => {
        contactMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Support request received.',
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
                'Send message',
            },
          ),
        )

        expect(
          await screen.findByRole(
            'status',
          ),
        ).toHaveTextContent(
          'Message sent',
        )

        expect(
          screen.getByText(
            /We received your request/i,
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'allows another message to be started after a successful submission',
      async () => {
        contactMock
          .mockResolvedValue({
            data: undefined,
            status: 204,
            message:
              'Support request received.',
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
                'Send message',
            },
          ),
        )

        await user.click(
          await screen.findByRole(
            'button',
            {
              name:
                'Send another message',
            },
          ),
        )

        expect(
          screen.getByRole(
            'button',
            {
              name:
                'Send message',
            },
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByLabelText(
            'Name',
          ),
        ).toHaveValue('')

        expect(
          screen.getByLabelText(
            'Email',
          ),
        ).toHaveValue('')

        expect(
          screen.getByLabelText(
            'Message',
          ),
        ).toHaveValue('')
      },
    )

    it(
      'maps backend validation errors back to the form',
      async () => {
        contactMock
          .mockRejectedValue(
            new ApiClientError(
              'Validation failed',
              400,
              {
                email:
                  'Enter a valid support email.',

                message:
                  'Please provide more detail.',

                turnstileToken:
                  'Security verification failed.',
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
                'Send message',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Enter a valid support email.',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Please provide more detail.',
          ),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Please complete the security check again.',
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'shows the rate-limit message when too many requests are sent',
      async () => {
        contactMock
          .mockRejectedValue(
            new ApiClientError(
              'Too many requests',
              429,
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
                'Send message',
            },
          ),
        )

        expect(
          await screen.findByText(
            'Too many support requests. Please wait before trying again.',
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'shows a connection message when the backend cannot be reached',
      async () => {
        contactMock
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
                'Send message',
            },
          ),
        )

        expect(
          await screen.findByText(
            'We could not confirm your submission. Check your connection and try again.',
          ),
        ).toBeInTheDocument()
      },
    )
  },
)