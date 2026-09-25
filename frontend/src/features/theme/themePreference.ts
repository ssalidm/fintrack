export type ThemePreference =
  | 'light'
  | 'dark'
  | 'system'

export type ResolvedTheme =
  | 'light'
  | 'dark'

export const THEME_STORAGE_KEY =
  'salif.theme.preference'

export function readStoredTheme(): ThemePreference {
  const value =
    window.localStorage.getItem(
      THEME_STORAGE_KEY,
    )

  return value === 'light' ||
    value === 'dark' ||
    value === 'system'
    ? value
    : 'system'
}

export function resolveTheme(
  preference: ThemePreference,
): ResolvedTheme {
  if (preference !== 'system') {
    return preference
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
    ? 'dark'
    : 'light'
}

export function applyResolvedTheme(
  theme: ResolvedTheme,
) {
  document.documentElement.dataset.theme =
    theme

  document.documentElement.style.colorScheme =
    theme
}

export function initializeTheme() {
  applyResolvedTheme(
    resolveTheme(
      readStoredTheme(),
    ),
  )
}
