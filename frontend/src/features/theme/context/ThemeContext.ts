import { createContext } from 'react'

import type {
  ResolvedTheme,
  ThemePreference,
} from '../themePreference'

export interface ThemeContextValue {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (
    preference: ThemePreference,
  ) => void
  toggleTheme: () => void
}

export const ThemeContext =
  createContext<ThemeContextValue | null>(
    null,
  )
