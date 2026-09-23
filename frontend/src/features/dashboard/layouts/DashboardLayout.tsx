import {
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router'

import DashboardFooter from '../components/DashboardFooter'
import DashboardTopBar from '../components/DashboardTopBar'
import DashboardSidebar from '../components/sidebar/DashboardSidebar'
import SalifLogo from '../components/sidebar/SalifLogo'
import SidebarContent from '../components/sidebar/SidebarContent'
import useSidebarPreference from '../hooks/useSidebarPreference'

export default function DashboardLayout() {
  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false)

  const sidebar =
    useSidebarPreference()

  return (
    <div className="min-h-screen bg-app text-ink">
      <DashboardSidebar
        isCollapsed={
          sidebar.isCollapsed
        }
        onToggle={
          sidebar.toggle
        }
      />

      <header
        className="
          sticky top-0
          z-30
          flex h-16
          items-center
          justify-between
          border-b border-line
          bg-app/90
          px-5
          shadow-sm
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div className="rounded-lg bg-primary px-2">
          <SalifLogo />
        </div>

        <button
          type="button"
          onClick={() =>
            setIsMenuOpen(true)
          }
          className="
            cursor-pointer
            rounded-lg
            p-2
            text-ink
            transition
            hover:bg-surface-muted
          "
          aria-label="Open navigation"
          aria-expanded={isMenuOpen}
        >
          <Menu
            size={23}
            aria-hidden
          />
        </button>
      </header>

      <div
        className={`
          dashboard-app-surface
          relative isolate
          flex min-h-screen
          flex-col
          transition-[margin-left]
          duration-200
          ${
            sidebar.isCollapsed
              ? 'lg:ml-20'
              : 'lg:ml-[18.5rem]'
          }
        `}
      >
        <DashboardTopBar />

        <div className="relative z-10 flex-1">
          <Outlet />
        </div>

        <div className="relative z-10">
          <DashboardFooter />
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/35"
            onClick={() =>
              setIsMenuOpen(false)
            }
            aria-label="Close navigation"
          />

          <aside className="relative h-full w-[18.5rem] max-w-[85vw] shadow-2xl">
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="
                absolute
                right-4 top-5
                z-10
                cursor-pointer
                rounded-lg
                p-2
                text-white
                transition
                hover:bg-white/10
              "
              aria-label="Close navigation"
            >
              <X
                size={21}
                aria-hidden
              />
            </button>

            <SidebarContent
              onNavigate={() =>
                setIsMenuOpen(false)
              }
            />
          </aside>
        </div>
      )}
    </div>
  )
}
