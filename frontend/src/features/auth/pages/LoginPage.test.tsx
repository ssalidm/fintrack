import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import type { LoginRequest } from '../api/types'
import { useAuth } from '../context/useAuth'
import LoginPage from './LoginPage'

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

const loginMock = vi.fn<
  (request: LoginRequest) => Promise<void>
>()

const logoutMock = vi.fn<() => Promise<void>>()

function renderLoginPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/dashboard',
        element: <h1>Dashboard</h1>,
      },
    ],
    {
      initialEntries: ['/login'],
    },
  )

  render(<RouterProvider router={router} />)

  return router
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset()
    logoutMock.mockReset()
    loginMock.mockResolvedValue(undefined)
    logoutMock.mockResolvedValue(undefined)

    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      status: 'unauthenticated',
      login: loginMock,
      logout: logoutMock,
      refreshAccessToken: vi.fn(async () => null),
    })
  })

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.click(
      screen.getByRole('button', {
        name: 'Sign in',
      }),
    )

    expect(
      await screen.findByText('Email is required'),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('Password is required'),
    ).toBeInTheDocument()

    expect(loginMock).not.toHaveBeenCalled()
  })

  it('allows the user to reveal and hide the password', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    const passwordInput = screen.getByLabelText('Password')

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(
      screen.getByRole('button', {
        name: 'Show password',
      }),
    )

    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(
      screen.getByRole('button', {
        name: 'Hide password',
      }),
    )

    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('logs in and redirects to the dashboard', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(
      screen.getByLabelText('Email'),
      'david@example.com',
    )

    await user.type(
      screen.getByLabelText('Password'),
      'ExistingPassword1!',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Sign in',
      }),
    )

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'david@example.com',
        password: 'ExistingPassword1!',
      })
    })

    expect(
      await screen.findByRole('heading', {
        name: 'Dashboard',
      }),
    ).toBeInTheDocument()
  })
})
