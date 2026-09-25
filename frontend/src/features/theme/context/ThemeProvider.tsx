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
  type ResolvedTheme,
  type ThemePreference,
} from '@/features/theme/themePreference'
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
    systemTheme,
    setSystemTheme,
  ] = useState<ResolvedTheme>(
    () => resolveTheme('system')
  )

  const resolvedTheme =
    preference === 'system'
      ? systemTheme
      : preference

  useEffect(() => {
    const mediaQuery =
      window.matchMedia('(prefers-color-scheme: dark)',
      )

    function handleChange(
      event: MediaQueryListEvent,
    ) {
      setSystemTheme(
        event.matches
          ? 'dark'
          : 'light'
      )
    }

    mediaQuery.addEventListener(
      'change',
      handleChange
    )

    return () => {
      mediaQuery.removeEventListener(
        'change',
        handleChange,
      )
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      preference,
    )

    applyResolvedTheme(
      resolvedTheme,
    )
  }, [
    preference,
    resolvedTheme
  ])

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
