export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'LOCKED'
  | 'DEACTIVATED'

export interface UserProfile {
  readonly id: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly timeZone: string
  readonly status: UserStatus
  readonly emailVerified: boolean
  readonly emailVerifiedAt: string | null
  readonly roles: string[]
  readonly lastLoginAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly version: number
}

export interface UpdateUserProfileRequest {
  version: number
  firstName: string
  lastName: string
  timeZone: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}