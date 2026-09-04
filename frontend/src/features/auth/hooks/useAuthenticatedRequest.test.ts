import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ApiClientError } from '../../../api/ApiClientError'
import { apiRequest } from '../../../api/client'
import { useAuth } from '../context/useAuth'
import { useAuthenticatedRequest } from './useAuthenticatedRequest'

vi.mock('../../../api/client', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

const apiRequestMock = vi.mocked(apiRequest)
const refreshAccessTokenMock = vi.fn<
  () => Promise<string | null>
>()

function createApiError(status: number): ApiClientError {
  const error = new Error('Request failed')

  Object.setPrototypeOf(error, ApiClientError.prototype)
  Object.defineProperty(error, 'status', {
    value: status,
    enumerable: true,
  })

  return error as ApiClientError
}

describe('useAuthenticatedRequest', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
    refreshAccessTokenMock.mockReset()

    vi.mocked(useAuth).mockReturnValue({
      accessToken: 'expired-access-token',
      status: 'authenticated',
      login: vi.fn(async () => undefined),
      logout: vi.fn(async () => undefined),
      refreshAccessToken: refreshAccessTokenMock,
    })
  })

  it('retries a 401 response with the refreshed access token', async () => {
    const unauthorizedError = createApiError(401)

    apiRequestMock
      .mockRejectedValueOnce(unauthorizedError)
      .mockResolvedValueOnce({
        data: {
          name: 'Primary account',
        },
        status: 200,
        message: 'Account retrieved',
        timestamp: '2026-09-03T12:00:00Z',
      })

    refreshAccessTokenMock.mockResolvedValue(
      'refreshed-access-token',
    )

    const { result } = renderHook(() =>
      useAuthenticatedRequest(),
    )

    const response = await result.current<{ name: string }>(
      '/accounts/primary',
    )

    expect(response.data.name).toBe('Primary account')
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1)

    expect(apiRequestMock).toHaveBeenNthCalledWith(
      1,
      '/accounts/primary',
      {
        accessToken: 'expired-access-token',
      },
    )

    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      '/accounts/primary',
      {
        accessToken: 'refreshed-access-token',
      },
    )
  })

  it('does not refresh for non-401 API errors', async () => {
    const forbiddenError = createApiError(403)

    apiRequestMock.mockRejectedValueOnce(forbiddenError)

    const { result } = renderHook(() =>
      useAuthenticatedRequest(),
    )

    await expect(
      result.current('/accounts/primary'),
    ).rejects.toBe(forbiddenError)

    expect(refreshAccessTokenMock).not.toHaveBeenCalled()
    expect(apiRequestMock).toHaveBeenCalledTimes(1)
  })

  it('preserves the original 401 when refresh fails', async () => {
    const unauthorizedError = createApiError(401)

    apiRequestMock.mockRejectedValueOnce(unauthorizedError)
    refreshAccessTokenMock.mockResolvedValue(null)

    const { result } = renderHook(() =>
      useAuthenticatedRequest(),
    )

    await expect(
      result.current('/accounts/primary'),
    ).rejects.toBe(unauthorizedError)

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1)
    expect(apiRequestMock).toHaveBeenCalledTimes(1)
  })
})
