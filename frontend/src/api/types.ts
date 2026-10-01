export type ValidationErrors = Record<string, string>

export interface ApiResponse<T> {
  readonly success: boolean
  readonly status: number
  readonly message: string
  readonly result?: T
  readonly errors?: ValidationErrors
  readonly timestamp: string
}

export interface PageResponse<T> {
  readonly items: T[]
  readonly page: number
  readonly size: number
  readonly totalElements: number
  readonly totalPages: number
  readonly first: boolean
  readonly last: boolean
  readonly hasNext: boolean
  readonly hasPrevious: boolean
}

export interface ApiResult<T> {
  readonly data: T
  readonly status: number
  readonly message: string
  readonly timestamp: string
}
