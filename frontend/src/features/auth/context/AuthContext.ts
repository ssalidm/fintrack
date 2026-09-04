import {createContext} from "react"
import type {LoginRequest} from "../api/types"

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  accessToken: string | null
  status: AuthStatus
  login: (request: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
