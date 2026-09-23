import { ApiClientError } from '../../../api/ApiClientError'
import type { ApiResponse } from '../../../api/types'
import { env } from '../../../config/env'

function buildUrl() {
  return `${env.apiBaseUrl}/profile/avatar`
}

async function errorFromResponse(
  response: Response,
) {
  let message =
    'The profile photo request could not be completed.'

  try {
    const body =
      (await response.json()) as ApiResponse<unknown>

    if (body.message) {
      message = body.message
    }
  } catch {
    // Response was not JSON.
  }

  return new ApiClientError(
    message,
    response.status,
  )
}

export async function fetchProfileAvatar(
  accessToken: string,
  signal?: AbortSignal,
): Promise<Blob | null> {
  const response = await fetch(
    buildUrl(),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
      cache: 'no-store',
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw await errorFromResponse(
      response,
    )
  }

  return response.blob()
}

export async function uploadProfileAvatar(
  accessToken: string,
  file: File,
): Promise<void> {
  const body = new FormData()

  body.append(
    'file',
    file,
  )

  const response = await fetch(
    buildUrl(),
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    },
  )

  if (!response.ok) {
    throw await errorFromResponse(
      response,
    )
  }
}

export async function deleteProfileAvatar(
  accessToken: string,
): Promise<void> {
  const response = await fetch(
    buildUrl(),
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw await errorFromResponse(
      response,
    )
  }
}
