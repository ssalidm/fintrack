import {
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { UserProfile } from '../../profile/api/types'
import { useProfile } from '../../profile/hooks/useProfile'
import AdminRoute from './AdminRoute'

vi.mock('../../profile/hooks/useProfile', () => ({
  useProfile: vi.fn(),
}))

const useProfileMock = vi.mocked(useProfile)
const refetchMock = vi.fn()

const adminProfile: UserProfile = {
  id: '7ab25167-22a7-4d4a-8226-248d88b090d4',
  email: 'admin@salif.test',
  firstName: 'Salif',
  lastName: 'Admin',
  timeZone: 'Africa/Johannesburg',
  status: 'ACTIVE',
  emailVerified: true,
  emailVerifiedAt: '2026-09-01T08:00:00Z',
  roles: ['ROLE_USER', 'ROLE_ADMIN'],
  lastLoginAt: '2026-09-11T08:00:00Z',
  createdAt: '2026-09-01T08:00:00Z',
  updatedAt: '2026-09-11T08:00:00Z',
  version: 2,
}

function profileQuery(
  overrides: Record<string, unknown>,
) {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    refetch: refetchMock,
    ...overrides,
  } as unknown as ReturnType<typeof useProfile>
}

function renderAdminRoute() {
  render(
    <MemoryRouter initialEntries={['/admin/users']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route
            path="/admin/users"
            element={<h1>User management content</h1>}
          />
        </Route>
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    refetchMock.mockReset()
    useProfileMock.mockReset()
  })

  it('shows a loading state while the profile is being fetched', () => {
    useProfileMock.mockReturnValue(
      profileQuery({ isPending: true }),
    )

    renderAdminRoute()

    expect(
      screen.getByText('Confirming admin access…'),
    ).toBeInTheDocument()
  })

  it('renders the protected page for an administrator', () => {
    useProfileMock.mockReturnValue(
      profileQuery({ data: adminProfile }),
    )

    renderAdminRoute()

    expect(
      screen.getByRole('heading', {
        name: 'User management content',
      }),
    ).toBeInTheDocument()
  })

  it('blocks an authenticated user without the admin role', () => {
    useProfileMock.mockReturnValue(
      profileQuery({
        data: {
          ...adminProfile,
          roles: ['ROLE_USER'],
        },
      }),
    )

    renderAdminRoute()

    expect(
      screen.getByRole('heading', {
        name: 'Admin access required',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('User management content'),
    ).not.toBeInTheDocument()
  })

  it('allows a failed access check to be retried', async () => {
    const user = userEvent.setup()

    useProfileMock.mockReturnValue(
      profileQuery({ isError: true }),
    )

    renderAdminRoute()

    await user.click(
      screen.getByRole('button', { name: 'Try again' }),
    )

    expect(refetchMock).toHaveBeenCalledOnce()
  })
})
