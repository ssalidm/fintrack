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

export interface MfaStatus {
  readonly enabled: boolean
  readonly setupPending: boolean
  readonly enabledAt: string | null
  readonly remainingRecoveryCodes: number
}

export interface MfaSetup {
  readonly manualEntryKey: string
  readonly otpAuthUri: string
}

export interface ConfirmMfaSetupRequest {
  code: string
}

export interface ConfirmMfaSetupResponse {
  readonly recoveryCodes: string[]
}

export interface DisableMfaRequest {
  currentPassword: string
  mfaCode: string
}

export interface RegenerateMfaRecoveryCodesRequest {
  currentPassword: string
  code: string
}

export interface MfaRecoveryCodesResponse {
  readonly recoveryCodes: string[]
}