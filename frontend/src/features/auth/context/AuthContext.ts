import { createContext } from 'react'

import type {
  LoginRequest,
  LoginResponse,
  MfaRecoverRequest,
  MfaVerifyRequest,
} from '../api/types'

export type AuthStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'

export interface AuthContextValue {
  accessToken: string | null
  status: AuthStatus

  login: (
    request: LoginRequest,
  ) => Promise<LoginResponse>

  verifyMfa: (
    request: MfaVerifyRequest,
  ) => Promise<void>

  recoverMfa: (
    request: MfaRecoverRequest,
  ) => Promise<void>

  logout: () => Promise<void>

  refreshAccessToken: () =>
    Promise<string | null>
}

export const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined)