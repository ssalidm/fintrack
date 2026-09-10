import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createMemoryRouter} from 'react-router'
import {RouterProvider} from 'react-router/dom'

import {authApi} from '../api/authApi'
import RegisterPage from './RegisterPage'

vi.mock('../api/authApi', () => ({
  authApi: {
    register: vi.fn(),
  },
}))

const registerMock = vi.mocked(authApi.register)

function renderRegisterPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/register',
        element: <RegisterPage/>,
      },
      {
        path: '/login',
        element: <h1>Sign in</h1>,
      },
      {
        path: '/resend-verification',
        element: <h1>Resend verification</h1>,
      },
    ],
    {
      initialEntries: ['/register'],
    },
  )

  render(<RouterProvider router={router}/>)
}

async function completeRegistrationForm() {
  const user = userEvent.setup()

  await user.type(
    screen.getByLabelText('First name'),
    'David',
  )

  await user.type(
    screen.getByLabelText('Last name'),
    'Ssali',
  )

  await user.type(
    screen.getByLabelText('Email'),
    'david@example.com',
  )

  await user.type(
    screen.getByLabelText('Password'),
    'SalifSecure1!',
  )

  await user.type(
    screen.getByLabelText('Confirm password'),
    'SalifSecure1!',
  )

  await user.click(
    screen.getByRole('checkbox', {
      name: /I agree to Salif’s/i,
    }),
  )

  return user
}

describe('RegisterPage', () => {
  beforeEach(() => {
    registerMock.mockReset()
    window.sessionStorage.clear()
  })

  it('does not call the API when the form is invalid', async () => {
    const user = userEvent.setup()

    renderRegisterPage()

    await user.click(
      screen.getByRole('button', {
        name: 'Create account',
      }),
    )

    expect(
      await screen.findByText(
        'Email is required',
      ),
    ).toBeInTheDocument()

    expect(
      await screen.findByText(
        'Password must contain at least 12 characters',
      ),
    ).toBeInTheDocument()

    expect(registerMock).not.toHaveBeenCalled()
  })

  it('submits the exact backend registration payload', async () => {
    registerMock.mockResolvedValue({
      data: {
        id: '54acfe58-a81b-4c87-8b38-0d7e931766fb',
        email: 'david@example.com',
        firstName: 'David',
        lastName: 'Ssali',
        status: 'PENDING_VERIFICATION',
        createdAt: '2026-09-03T12:00:00Z',
      },
      status: 201,
      message: 'Registration successful',
      timestamp: '2026-09-03T12:00:00Z',
    })

    renderRegisterPage()

    const user =
      await completeRegistrationForm()

    await user.click(
      screen.getByRole('button', {
        name: 'Create account',
      }),
    )

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        firstName: 'David',
        lastName: 'Ssali',
        email: 'david@example.com',
        password: 'SalifSecure1!',
      })
    })

    expect(registerMock).toHaveBeenCalledTimes(1)

    expect(registerMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        confirmPassword: expect.anything(),
        acceptTerms: expect.anything(),
      }),
    )
  })

  it('shows the verification-email cooldown after registration', async () => {
    registerMock.mockResolvedValue({
      data: {
        id: '54acfe58-a81b-4c87-8b38-0d7e931766fb',
        email: 'david@example.com',
        firstName: 'David',
        lastName: 'Ssali',
        status: 'PENDING_VERIFICATION',
        createdAt: '2026-09-03T12:00:00Z',
      },
      status: 201,
      message: 'Registration successful',
      timestamp: '2026-09-03T12:00:00Z',
    })

    renderRegisterPage()

    const user =
      await completeRegistrationForm()

    await user.click(
      screen.getByRole('button', {
        name: 'Create account',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Check your email',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('david@example.com'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Resend available in 1:00/i,
      }),
    ).toBeDisabled()

    expect(
      screen.queryByRole('link', {
        name: 'Resend verification email',
      }),
    ).not.toBeInTheDocument()
  })

  it('requires the terms to be accepted', async () => {
    const user = userEvent.setup()

    renderRegisterPage()

    await user.type(
      screen.getByLabelText('First name'),
      'David',
    )

    await user.type(
      screen.getByLabelText('Last name'),
      'Ssali',
    )

    await user.type(
      screen.getByLabelText('Email'),
      'david@example.com',
    )

    await user.type(
      screen.getByLabelText('Password'),
      'SalifSecure1!',
    )

    await user.type(
      screen.getByLabelText('Confirm password'),
      'SalifSecure1!',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Create account',
      }),
    )

    expect(
      await screen.findByText(
        'You must accept the Terms and Privacy Policy',
      ),
    ).toBeInTheDocument()

    expect(registerMock).not.toHaveBeenCalled()
  })
})