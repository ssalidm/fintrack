import {
  Monitor,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'

import { useTheme } from '../../theme/context/useTheme'
import type { ThemePreference } from '../../theme/themePreference'

interface ThemeOption {
  value: ThemePreference
  label: string
  description: string
  Icon: LucideIcon
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description:
      'Always use the light theme.',
    Icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description:
      'Always use the dark theme.',
    Icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description:
      'Follow your device setting.',
    Icon: Monitor,
  },
]

export default function ThemePreferenceSetting() {
  const {
    preference,
    resolvedTheme,
    setPreference,
  } = useTheme()

  return (
    <div className="py-5">
      <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-8">
        <div>
          <p className="text-sm font-medium text-muted">
            Theme
          </p>

          <p className="mt-1 text-xs leading-5 text-subtle">
            Choose how Salif looks
            on this device.
          </p>
        </div>

        <div>
          <div
            className="grid gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Theme preference"
          >
            {themeOptions.map(
              ({
                value,
                label,
                description,
                Icon,
              }) => {
                const isSelected =
                  preference === value

                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={
                      isSelected
                    }
                    onClick={() =>
                      setPreference(
                        value,
                      )
                    }
                    className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-primary bg-primary text-inverse'
                        : 'border-line bg-surface text-ink hover:bg-surface-muted'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isSelected
                          ? 'text-inverse'
                          : 'text-accent'
                      }
                      aria-hidden
                    />

                    <p className="mt-3 text-sm font-semibold">
                      {label}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        isSelected
                          ? 'text-inverse/75'
                          : 'text-muted'
                      }`}
                    >
                      {
                        description
                      }
                    </p>
                  </button>
                )
              },
            )}
          </div>

          {preference ===
            'system' && (
            <p className="type-caption mt-3">
              Your device is
              currently using{' '}
              <span className="font-semibold text-ink">
                {
                  resolvedTheme
                }
              </span>{' '}
              mode.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
