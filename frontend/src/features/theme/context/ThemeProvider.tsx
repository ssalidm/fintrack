import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  applyResolvedTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '../themePreference'
import {
  ThemeContext,
  type ThemeContextValue,
} from './ThemeContext'

interface ThemeProviderProps {
  readonly children: ReactNode
}

export default function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [
    preference,
    setPreference,
  ] =
    useState<ThemePreference>(
      readStoredTheme,
    )

  const [
    resolvedTheme,
    setResolvedTheme,
  ] = useState(() =>
    resolveTheme(preference),
  )

  useEffect(() => {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      preference,
    )

    if (
      preference !== 'system'
    ) {
      setResolvedTheme(
        preference,
      )
      applyResolvedTheme(
        preference,
      )
      return
    }

    const mediaQuery =
      window.matchMedia(
        '(prefers-color-scheme: dark)',
      )

    function syncSystemTheme() {
      const nextTheme =
        mediaQuery.matches
          ? 'dark'
          : 'light'

      setResolvedTheme(
        nextTheme,
      )

      applyResolvedTheme(
        nextTheme,
      )
    }

    syncSystemTheme()

    mediaQuery.addEventListener(
      'change',
      syncSystemTheme,
    )

    return () => {
      mediaQuery.removeEventListener(
        'change',
        syncSystemTheme,
      )
    }
  }, [preference])

  const value =
    useMemo<ThemeContextValue>(
      () => ({
        preference,
        resolvedTheme,
        setPreference,
        toggleTheme: () => {
          setPreference(
            resolvedTheme ===
              'dark'
              ? 'light'
              : 'dark',
          )
        },
      }),
      [
        preference,
        resolvedTheme,
      ],
    )

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  )
}
