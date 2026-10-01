import type { ValidationErrors } from './types'

export class ApiClientError extends Error {
  readonly status: number
  readonly validationErrors?: ValidationErrors

  constructor(
    message: string,
    status: number,
    validationErrors?: ValidationErrors,
  ) {
    super(message)

    this.name = 'ApiClientError'
    this.status = status
    this.validationErrors = validationErrors
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }
}
