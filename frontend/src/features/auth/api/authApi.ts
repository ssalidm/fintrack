import { apiRequest } from '../../../api/client'

import type {
  ConfirmEmailChangeRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MfaRecoverRequest,
  MfaVerifyRequest,
  RefreshRequest,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  TokenResponse,
  VerifyEmailRequest,
} from './types'

export const authApi = {
  register(request: RegisterRequest) {
    return apiRequest<RegisterResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  login(request: LoginRequest) {
    return apiRequest<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  verifyMfa(request: MfaVerifyRequest) {
    return apiRequest<TokenResponse>(
      '/auth/mfa/verify',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  recoverMfa(request: MfaRecoverRequest) {
    return apiRequest<TokenResponse>(
      '/auth/mfa/recover',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  refresh(request: RefreshRequest) {
    return apiRequest<TokenResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  logout(accessToken: string) {
    return apiRequest<void>(
      '/auth/logout',
      {
        method: 'POST',
        accessToken,
      },
    )
  },

  verifyEmail(request: VerifyEmailRequest) {
    return apiRequest<void>(
      '/auth/verify-email',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  resendVerification(
    request: ResendVerificationRequest,
  ) {
    return apiRequest<void>(
      '/auth/resend-verification',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  forgotPassword(
    request: ForgotPasswordRequest,
  ) {
    return apiRequest<void>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: request,
      },
    )
  },

  resetPassword(
    request: ResetPasswordRequest,
  ) {
    return apiRequest<void>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: request,
      },
    )
  },
  
  confirmEmailChange(
    request: ConfirmEmailChangeRequest) {
    return apiRequest<void>(
      '/auth/change-email/confirm',
      {
        method: 'POST',
        body: request,
      },
    )
  },
}