import {
  Moon,
  Sun,
} from 'lucide-react'

import {
  sidebarItemBase,
} from '../../dashboard/components/sidebar/sidebarStyles'
import { useTheme } from '../context/useTheme'

interface ThemeToggleProps {
  readonly isCollapsed?: boolean
}

export default function ThemeToggle({
  isCollapsed = false,
}: ThemeToggleProps) {
  const {
    resolvedTheme,
    toggleTheme,
  } = useTheme()

  const isDark =
    resolvedTheme === 'dark'

  const label = isDark
    ? 'Dark mode'
    : 'Light mode'

  const actionLabel = isDark
    ? 'Switch to light mode'
    : 'Switch to dark mode'

  const Icon = isDark
    ? Moon
    : Sun

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={
        isCollapsed
          ? actionLabel
          : undefined
      }
      aria-label={
        isCollapsed
          ? actionLabel
          : undefined
      }
      className={[
        sidebarItemBase,
        isCollapsed
          ? 'justify-center px-0'
          : 'gap-3',
        'cursor-pointer',
        'text-[#c5d8d0]',
        'hover:bg-white/[0.07]',
        'hover:text-white',
      ].join(' ')}
    >
      <Icon
        size={18}
        className="shrink-0"
        aria-hidden
      />

      {!isCollapsed && (
        <span className="truncate">
          {label}
        </span>
      )}
    </button>
  )
}
