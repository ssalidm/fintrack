import {
  ArrowLeftRight,
  CalendarClock,
  ChartPie,
  ChevronDown,
  Landmark,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  ReceiptText,
  Repeat2,
  Shapes,
  Target,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useId,
  useState,
} from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router'

import salifLogoLight from '../../../assets/brand/salif-logo-light.png'
import { useAuth } from '../../auth/context/useAuth'
import { useProfile } from '../../profile/hooks/useProfile'

type SidebarSection =
  | 'money'
  | 'planning'

interface NavigationItem {
  to: string
  label: string
  icon: LucideIcon
}

const moneyMovementItems: NavigationItem[] = [
  {
    to: '/transactions',
    label: 'Transactions',
    icon: ReceiptText,
  },
  {
    to: '/transfers',
    label: 'Transfers',
    icon: Repeat2,
  },
  {
    to: '/recurring',
    label: 'Recurring',
    icon: CalendarClock,
  },
]

const planningItems: NavigationItem[] = [
  {
    to: '/accounts',
    label: 'Accounts',
    icon: Landmark,
  },
  {
    to: '/categories',
    label: 'Categories',
    icon: Shapes,
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: ChartPie,
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: Target,
  },
]

function activeSectionForPath(
  pathname: string,
): SidebarSection | null {
  if (
    moneyMovementItems.some(
      (item) => item.to === pathname,
    )
  ) {
    return 'money'
  }

  if (
    planningItems.some(
      (item) => item.to === pathname,
    )
  ) {
    return 'planning'
  }

  return null
}

function SalifLogo() {
  return (
    <div className="h-[50px] w-[118px] overflow-hidden">
      <img
        src={salifLogoLight}
        alt="Salif"
        className="h-[156px] w-[156px] max-w-none -translate-x-[19px] -translate-y-[50px]"
      />
    </div>
  )
}

interface SidebarGroupProps {
  label: string
  icon: LucideIcon
  items: NavigationItem[]
  menuId: string
  isActive: boolean
  isExpanded: boolean
  onToggle: () => void
  onNavigate?: () => void
}

function SidebarGroup({
  label,
  icon: GroupIcon,
  items,
  menuId,
  isActive,
  isExpanded,
  onToggle,
  onNavigate,
}: SidebarGroupProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={menuId}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#f7f3e9] font-semibold text-[#174f43] shadow-sm'
            : 'text-[#d5e4dd] hover:bg-white/5 hover:text-white'
        }`}
      >
        <GroupIcon
          size={18}
          className="shrink-0"
          aria-hidden
        />

        <span className="min-w-0 flex-1 truncate">
          {label}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
            isExpanded
              ? 'rotate-180'
              : ''
          }`}
          aria-hidden
        />
      </button>

      <div
        id={menuId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${
          isExpanded
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-6 mt-2 border-l border-white/15 pl-3">
            <div className="space-y-1">
              {items.map((item) => {
                const ItemIcon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={({
                      isActive: itemIsActive,
                    }) =>
                      [
                        'flex cursor-pointer items-center gap-3 rounded-lg',
                        'px-3 py-2 text-sm transition-colors',
                        itemIsActive
                          ? 'bg-white/10 font-semibold text-white'
                          : 'text-[#bed2c9] hover:bg-white/5 hover:text-white',
                      ].join(' ')
                    }
                  >
                    <ItemIcon
                      size={15}
                      aria-hidden
                    />

                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  onNavigate?: () => void
}

function SidebarContent({
  onNavigate,
}: SidebarContentProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const moneyMenuId = useId()
  const planningMenuId = useId()

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false)

  const [
    openSection,
    setOpenSection,
  ] = useState<SidebarSection | null>(
    null,
  )

  const [
    collapsedPath,
    setCollapsedPath,
  ] = useState<string | null>(null)

  const { data: profile } = useProfile()
  const { logout } = useAuth()

  const activeSection =
    activeSectionForPath(
      location.pathname,
    )

  const expandedSection =
    openSection ??
    (
      collapsedPath !== location.pathname
        ? activeSection
        : null
    )

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'Your account'

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
      .toUpperCase()
    : 'S'

  const profileIsActive =
    location.pathname === '/profile'

  function toggleSection(
    section: SidebarSection,
  ) {
    if (expandedSection === section) {
      setOpenSection(null)
      setCollapsedPath(
        location.pathname,
      )

      return
    }

    setOpenSection(section)
    setCollapsedPath(null)
  }

  function handleOverviewNavigation() {
    setOpenSection(null)
    setCollapsedPath(null)
    onNavigate?.()
  }

  async function handleLogout() {
    setIsLoggingOut(true)

    await logout()

    onNavigate?.()

    navigate('/login', {
      replace: true,
    })
  }

  return (
    <div className="salif-sidebar grid h-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#174f43] px-5 py-6 text-[#f7f3e9]">
      <div className="salif-sidebar-brand border-b border-white/10 px-2 pb-6">
        <NavLink
          to="/dashboard"
          onClick={
            handleOverviewNavigation
          }
          aria-label="Go to dashboard"
          className="inline-flex cursor-pointer"
        >
          <SalifLogo />
        </NavLink>

        <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-[#a9c9bc]">
          YOUR MONEY, MADE CLEARER
        </p>
      </div>

      <nav
        className="salif-sidebar-nav salif-sidebar-scrollbar mt-6 min-h-0 overflow-y-auto overscroll-contain pr-1"
        aria-label="Main navigation"
      >
        <p className="mb-2 px-4 text-[10px] font-semibold tracking-[0.16em] text-[#91b5a7]">
          YOUR SPACE
        </p>

        <div className="space-y-1.5">
          <NavLink
            to="/dashboard"
            end
            onClick={
              handleOverviewNavigation
            }
            className={({ isActive }) =>
              [
                'flex cursor-pointer items-center gap-3 rounded-xl',
                'px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#f7f3e9] font-semibold text-[#174f43] shadow-sm'
                  : 'text-[#d5e4dd] hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            <LayoutDashboard
              size={18}
              aria-hidden
            />

            Overview
          </NavLink>

          <SidebarGroup
            label="Money in motion"
            icon={ArrowLeftRight}
            items={moneyMovementItems}
            menuId={moneyMenuId}
            isActive={
              activeSection === 'money'
            }
            isExpanded={
              expandedSection === 'money'
            }
            onToggle={() =>
              toggleSection('money')
            }
            onNavigate={onNavigate}
          />

          <SidebarGroup
            label="Plan & organise"
            icon={ListTree}
            items={planningItems}
            menuId={planningMenuId}
            isActive={
              activeSection ===
              'planning'
            }
            isExpanded={
              expandedSection ===
              'planning'
            }
            onToggle={() =>
              toggleSection('planning')
            }
            onNavigate={onNavigate}
          />
        </div>
      </nav>

      <div className="border-t border-white/10 pt-4">
        <div
          className={`rounded-2xl border p-2 transition-colors ${
            profileIsActive
              ? 'border-[#bcd9c5]/50 bg-white/10'
              : 'border-white/10 bg-black/5'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <NavLink
              to="/profile"
              onClick={onNavigate}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-1.5 transition hover:bg-white/5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#bcd9c5] text-sm font-bold text-[#174f43] ring-2 ring-white/10">
                {initials}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {displayName}
                </span>

                <span className="mt-0.5 block truncate text-[11px] text-[#afd0c3]">
                  {profile?.email ??
                    'View profile'}
                </span>
              </span>
            </NavLink>

            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() =>
                void handleLogout()
              }
              aria-label={
                isLoggingOut
                  ? 'Signing out'
                  : 'Sign out'
              }
              title={
                isLoggingOut
                  ? 'Signing out…'
                  : 'Sign out'
              }
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-[#c8ddd5] transition hover:bg-[#f7f3e9] hover:text-[#174f43] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut
                size={18}
                className={
                  isLoggingOut
                    ? 'animate-pulse'
                    : ''
                }
                aria-hidden
              />
            </button>
          </div>
        </div>

        <p className="salif-sidebar-status mt-3 flex items-center gap-2 px-2 text-[11px] text-[#a9c9bc]">
          <span
            className="size-1.5 rounded-full bg-[#9bc7a8]"
            aria-hidden
          />

          Everything looks steady
        </p>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#173c32]">
      <aside className="fixed inset-y-0 left-0 hidden w-[18.5rem] lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dedbd2] bg-[#f7f5ef]/95 px-5 backdrop-blur lg:hidden">
        <div className="rounded-lg bg-[#174f43] px-2">
          <SalifLogo />
        </div>

        <button
          type="button"
          onClick={() =>
            setIsMenuOpen(true)
          }
          className="cursor-pointer rounded-lg p-2 text-[#173c32] transition hover:bg-[#e7ece7]"
          aria-label="Open navigation"
          aria-expanded={isMenuOpen}
        >
          <Menu
            size={23}
            aria-hidden
          />
        </button>
      </header>

      <div className="lg:pl-[18.5rem]">
        <Outlet />
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
              className="absolute right-4 top-5 z-10 cursor-pointer rounded-lg p-2 text-white transition hover:bg-white/10"
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