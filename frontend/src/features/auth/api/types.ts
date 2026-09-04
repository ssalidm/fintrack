export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'LOCKED'
  | 'DEACTIVATED'

export interface RegisterRequest {
  readonly email: string
  readonly password: string
  readonly firstName: string
  readonly lastName: string
}

export interface RegisterResponse {
  readonly id: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly status: UserStatus
  readonly createdAt: string
}

export interface LoginRequest {
  readonly email: string
  readonly password: string
}

export interface TokenResponse {
  readonly accessToken: string
  readonly refreshToken: string
  readonly tokenType: string
  readonly expiresIn: number
}

export interface RefreshRequest {
  readonly refreshToken: string
}

export interface VerifyEmailRequest {
  readonly token: string
}

export interface ResendVerificationRequest {
  readonly email: string
}

export interface ForgotPasswordRequest {
  readonly email: string
}

export interface ResetPasswordRequest {
  readonly token: string
  readonly newPassword: string
}
