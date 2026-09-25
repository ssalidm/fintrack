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
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { authApi } from '@/features/auth/api/authApi'
import RegisterPage from './RegisterPage'
import { useAuth } from '@/features/auth/context/useAuth'


vi.mock('@/features/auth/api/authApi', () => ({
  authApi: {
    register: vi.fn(),
    startRegistration: vi.fn(),
  },
}))

vi.mock('@/features/auth/context/useAuth', () => ({
  useAuth: vi.fn(),
}))

const startRegistrationMock = vi.mocked(authApi.startRegistration)

function renderRegisterPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/register',
        element: <RegisterPage />,
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

  render(<RouterProvider router={router} />)
}

async function enterRegistrationEmail() {
  const user = userEvent.setup()

  await user.type(
    screen.getByLabelText('Email'),
    'david@example.com',
  )

  return user
}

describe('RegisterPage', () => {
  beforeEach(() => {
    startRegistrationMock.mockReset()
    window.sessionStorage.clear()

    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      status: 'unauthenticated',
      login: vi.fn(),
      googleLogin: vi.fn(),
      verifyMfa: vi.fn(),
      recoverMfa: vi.fn(),
      logout: vi.fn(),
      refreshAccessToken: vi.fn(
        async () => null,
      ),
    })
  })

  it('does not call the API when the email is invalid', async () => {
    const user = userEvent.setup()

    renderRegisterPage()

    await user.click(
      screen.getByRole('button', {
        name: 'Continue',
      }),
    )

    expect(
      await screen.findByText('Email is required'),
    ).toBeInTheDocument()

    expect(startRegistrationMock,
    ).not.toHaveBeenCalled()
  })

  it('starts registration with the exact email payload', async () => {
    startRegistrationMock.mockResolvedValue({
      data: undefined,
      status: 204,
      message: 'Registration started successfully',
      timestamp: '2026-09-03T12:00:00Z',
    })

    renderRegisterPage()

    const user = await enterRegistrationEmail()

    await user.click(
      screen.getByRole('button', {
        name: 'Continue',
      }),
    )

    await waitFor(() => {
      expect(startRegistrationMock).toHaveBeenCalledWith({
        email: 'david@example.com',
      })
    })

    expect(startRegistrationMock).toHaveBeenCalledTimes(1)
  })

  it('shows the registration email confirmation after starting registration', async () => {
    startRegistrationMock.mockResolvedValue({
      data: undefined,
      status: 204,
      message: 'Registration started successfully',
      timestamp: '2026-09-03T12:00:00Z',
    })

    renderRegisterPage()

    const user = await enterRegistrationEmail()

    await user.click(
      screen.getByRole('button', {
        name: 'Continue',
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
  })

  it('allows the user to start registration with a different email', async () => {
    startRegistrationMock.mockResolvedValue({
      data: undefined,
      status: 204,
      message: 'Registration started successfully',
      timestamp: '2026-09-03T12:00:00Z',
    })

    renderRegisterPage()

    const user = await enterRegistrationEmail()

    await user.click(
      screen.getByRole('button', {
        name: 'Continue',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Check your email',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Use a different email',
      }),
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Email',
      }),
    ).toBeInTheDocument()
  })
})