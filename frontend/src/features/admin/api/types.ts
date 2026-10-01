import type { UserStatus } from '@/features/profile/api/types'

export interface AdminUser {
  readonly id: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly status: UserStatus
  readonly emailVerified: boolean
  readonly roles: string[]
  readonly lastLoginAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly version: number
}

export interface AdminUserSession {
  readonly id: string
  readonly createdAt: string
  readonly lastSeenAt: string
  readonly expiresAt: string
  readonly active: boolean
  readonly revokedAt: string | null
  readonly revocationReason: string | null
  readonly userAgent: string | null
  readonly version: number
}

export interface AdminUserVersionRequest {
  readonly version: number
}
