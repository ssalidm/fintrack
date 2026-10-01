import {
  render,
  screen,
} from '@testing-library/react'
import {createMemoryRouter} from 'react-router'
import {RouterProvider} from 'react-router/dom'
import {
  describe,
  expect,
  it,
} from 'vitest'

import RouteErrorPage from './RouteErrorPage'

function renderRouteError(error: Error) {
  const router = createMemoryRouter(
    [
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: '/register',
            loader: () => {
              throw error
            },
            element: <p>Registration page</p>,
          },
        ],
      },
    ],
    {
      initialEntries: ['/register'],
    },
  )

  render(<RouterProvider router={router} />)
}

describe('RouteErrorPage', () => {
  it('provides recovery when a nested route fails to load', async () => {
    renderRouteError(
      new TypeError(
        'Failed to fetch dynamically imported module: https://salif.local/src/features/auth/pages/RegisterPage.tsx',
      ),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'This page needs a quick refresh',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Refresh Salif',
      }),
    ).toBeEnabled()

    expect(
      screen.getByRole('link', {
        name: 'Return home',
      }),
    ).toHaveAttribute('href', '/')

    expect(
      screen.queryByText(
        /Failed to fetch dynamically imported module/,
      ),
    ).not.toBeInTheDocument()
  })

  it('hides internal details for unexpected errors', async () => {
    renderRouteError(
      new Error('Internal implementation details'),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Something didn’t load correctly',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Internal implementation details'),
    ).not.toBeInTheDocument()
  })
})