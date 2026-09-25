import {
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import SidebarContent from './SidebarContent'

interface DashboardSidebarProps {
  readonly isCollapsed: boolean
  readonly onToggle: () => void
}

export default function DashboardSidebar({
  isCollapsed,
  onToggle,
}: DashboardSidebarProps) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0
        z-30
        hidden
        transition-[width]
        duration-200
        lg:block
        ${
          isCollapsed
            ? 'w-20'
            : 'w-[18.5rem]'
        }
      `}
    >
      <SidebarContent
        isCollapsed={isCollapsed}
      />

      <button
        type="button"
        onClick={onToggle}
        title={
          isCollapsed
            ? 'Expand sidebar'
            : 'Collapse sidebar'
        }
        aria-label={
          isCollapsed
            ? 'Expand sidebar'
            : 'Collapse sidebar'
        }
        className="
          absolute
          right-0 top-24
          z-40
          grid size-8
          translate-x-1/2
          cursor-pointer
          place-items-center
          rounded-full
          border border-line
          bg-surface
          text-muted
          shadow-sm
          transition
          hover:border-accent
          hover:text-primary
        "
      >
        {isCollapsed ? (
          <PanelLeftOpen
            size={15}
            aria-hidden
          />
        ) : (
          <PanelLeftClose
            size={15}
            aria-hidden
          />
        )}
      </button>
    </aside>
  )
}
