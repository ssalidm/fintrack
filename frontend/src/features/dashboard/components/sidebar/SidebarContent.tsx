import {
  LifeBuoy,
  Settings,
  UsersRound,
} from 'lucide-react'
import { NavLink } from 'react-router'

import { useProfile } from '@/features/profile/hooks/useProfile'
import ThemeToggle from '@/features/theme/components/ThemeToggle'
import SalifLogo from './SalifLogo'
import {
  sidebarNavigationItems,
} from './sidebarConfig'
import {
  sidebarItemClass,
} from './sidebarStyles'

interface SidebarContentProps {
  readonly onNavigate?: () => void
  readonly isCollapsed?: boolean
}

export default function SidebarContent({
  onNavigate,
  isCollapsed = false,
}: SidebarContentProps) {
  const { data: profile } =
    useProfile()

  return (
    <div
      className={`
        salif-sidebar
        grid h-full
        grid-rows-[auto_minmax(0,1fr)_auto]
        overflow-hidden
        bg-[#0d4f3f]
        py-6
        text-[#f7f3e9]
        shadow-[12px_0_45px_rgba(9,47,40,0.12)]
        ${
          isCollapsed
            ? 'px-4'
            : 'px-5'
        }
      `}
    >
      <div
        className={`
          border-b border-white/10
          pb-5
          ${
            isCollapsed
              ? 'flex justify-center'
              : 'px-2'
          }
        `}
      >
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          aria-label="Go to dashboard"
          className="inline-flex cursor-pointer"
        >
          <SalifLogo
            compact={isCollapsed}
          />
        </NavLink>
      </div>

      <nav
        className="
          salif-sidebar-nav
          salif-sidebar-scrollbar
          mt-5
          min-h-0
          overflow-y-auto
          overscroll-contain
          pr-1
        "
        aria-label="Main navigation"
      >
        <div className="space-y-1">
          {sidebarNavigationItems.map(
            (item) => {
              const ItemIcon =
                item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  title={
                    isCollapsed
                      ? item.label
                      : undefined
                  }
                  aria-label={
                    isCollapsed
                      ? item.label
                      : undefined
                  }
                  className={({ isActive }) =>
                    sidebarItemClass(
                      isActive,
                      isCollapsed,
                    )
                  }
                >
                  <ItemIcon
                    size={18}
                    className="shrink-0"
                    aria-hidden
                  />

                  {!isCollapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              )
            },
          )}

          {profile?.roles.includes(
            'ROLE_ADMIN',
          ) && (
            <div className="pt-4">
              <div className="mb-4 border-t border-white/10" />

              <NavLink
                to="/admin/users"
                onClick={onNavigate}
                title={
                  isCollapsed
                    ? 'User management'
                    : undefined
                }
                aria-label={
                  isCollapsed
                    ? 'User management'
                    : undefined
                }
                className={({ isActive }) =>
                  sidebarItemClass(
                    isActive,
                    isCollapsed,
                  )
                }
              >
                <UsersRound
                  size={18}
                  className="shrink-0"
                  aria-hidden
                />

                {!isCollapsed && (
                  <span className="truncate">
                    User management
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-white/10 pt-4">
        <div className="space-y-1">
          <NavLink
            to="/profile"
            onClick={onNavigate}
            title={
              isCollapsed
                ? 'Account settings'
                : undefined
            }
            aria-label={
              isCollapsed
                ? 'Account settings'
                : undefined
            }
            className={({ isActive }) =>
              sidebarItemClass(
                isActive,
                isCollapsed,
              )
            }
          >
            <Settings
              size={18}
              className="shrink-0"
              aria-hidden
            />

            {!isCollapsed && (
              <span className="truncate">
                Account settings
              </span>
            )}
          </NavLink>

          <NavLink
            to="/support"
            onClick={onNavigate}
            title={
              isCollapsed
                ? 'Support'
                : undefined
            }
            aria-label={
              isCollapsed
                ? 'Support'
                : undefined
            }
            className={({ isActive }) =>
              sidebarItemClass(
                isActive,
                isCollapsed,
              )
            }
          >
            <LifeBuoy
              size={18}
              className="shrink-0"
              aria-hidden
            />

            {!isCollapsed && (
              <span className="truncate">
                Support
              </span>
            )}
          </NavLink>

          <ThemeToggle
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </div>
  )
}
