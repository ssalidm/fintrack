import { env } from '../config/env'
import { ApiClientError } from './ApiClientError'
import type { ApiResponse, ApiResult } from './types'

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  readonly body?: unknown
  readonly accessToken?: string
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${env.apiBaseUrl}${normalizedPath}`
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiClientError(
      'The server returned an invalid response.',
      response.status,
    )
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const {
    accessToken,
    body,
    headers: customHeaders,
    ...requestOptions
  } = options

  const headers = new Headers(customHeaders)
  headers.set('Accept', 'application/json')

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path), {
      ...requestOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiClientError(
      'Unable to connect to the server. Please try again.',
      0,
    )
  }

  const apiResponse = await parseResponse<T>(response)

  if (!response.ok || !apiResponse.success) {
    throw new ApiClientError(
      apiResponse.message || 'The request could not be completed.',
      response.status,
      apiResponse.errors,
    )
  }

  return {
    data: apiResponse.result as T,
    status: apiResponse.status,
    message: apiResponse.message,
    timestamp: apiResponse.timestamp,
  }
}
