import {useState} from 'react'
import {
  ArrowLeftRight,
  CalendarClock,
  ChevronDown,
  CircleGauge,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Repeat2,
  Settings,
  Shapes,
  Target,
  X,
} from 'lucide-react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router'
import salifLogoLight from '../../../assets/brand/salif-logo-light.png'
import {useAuth} from '../../auth/context/useAuth'
import {useProfile} from '../../profile/hooks/useProfile'

const moneyMovementPaths = [
  '/money-in-motion',
  '/transactions',
  '/transfers',
  '/recurring',
]

const moneyMovementItems = [
  {
    to: '/money-in-motion',
    label: 'Overview',
    icon: CircleGauge,
  },
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

const primaryNavigationItems = [
  {
    to: '/categories',
    label: 'Categories',
    icon: Shapes,
  },
  {
    to: '/accounts',
    label: 'Accounts',
    icon: Landmark,
  },
]

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

interface SidebarContentProps {
  onNavigate?: () => void
}

function SidebarContent({
                          onNavigate,
                        }: SidebarContentProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] =
    useState(false)

  const [isMoneyMenuOpen, setIsMoneyMenuOpen] =
    useState(false)

  const [
    collapsedActiveMovementPath,
    setCollapsedActiveMovementPath,
  ] = useState<string | null>(null)

  const {data: profile} = useProfile()
  const {logout} = useAuth()

  const isMoneyMovementActive =
    moneyMovementPaths.includes(location.pathname)

  const isMoneyMovementExpanded =
    isMoneyMenuOpen ||
    (
      isMoneyMovementActive &&
      collapsedActiveMovementPath !==
      location.pathname
    )

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'Your account'

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
      .toUpperCase()
    : 'S'

  function toggleMoneyMovement() {
    if (isMoneyMovementExpanded) {
      setIsMoneyMenuOpen(false)
      setCollapsedActiveMovementPath(
        location.pathname,
      )

      return
    }

    setIsMoneyMenuOpen(true)
    setCollapsedActiveMovementPath(null)
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
    onNavigate?.()
    navigate('/login', {replace: true})
  }

  const navigationClassName =
    'flex cursor-pointer items-center gap-3 rounded-xl ' +
    'px-4 py-2.5 text-sm font-medium transition-colors'

  return (
    <div className="flex h-full flex-col bg-[#174f43] px-5 py-7 text-[#f7f3e9]">
      <div className="px-2">
        <SalifLogo/>
      </div>

      <div className="mt-12 flex items-center gap-3 px-2">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#bcd9c5] text-sm font-bold text-[#174f43]">
          {initials}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {displayName}
          </p>

          <p className="mt-1 text-xs text-[#bcd9c5]">
            Welcome back
          </p>
        </div>
      </div>

      <nav
        className="mt-9 space-y-1.5"
        aria-label="Main navigation"
      >
        <NavLink
          to="/dashboard"
          end
          onClick={onNavigate}
          className={({isActive}) =>
            [
              navigationClassName,
              isActive
                ? 'bg-white/10 text-white'
                : 'text-[#d5e4dd] hover:bg-white/5 hover:text-white',
            ].join(' ')
          }
        >
          <LayoutDashboard size={18} aria-hidden/>
          Overview
        </NavLink>

        <div>
          <div
            className={`flex items-center rounded-xl transition-colors ${
              isMoneyMovementActive
                ? 'bg-white/10 text-white'
                : 'text-[#d5e4dd] hover:bg-white/5 hover:text-white'
            }`}
          >
            <NavLink
              to="/money-in-motion"
              onClick={onNavigate}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium"
            >
              <ArrowLeftRight
                size={18}
                className="shrink-0"
                aria-hidden
              />

              <span className="truncate">
                Money in motion
              </span>
            </NavLink>

            <button
              type="button"
              onClick={toggleMoneyMovement}
              aria-expanded={isMoneyMovementExpanded}
              aria-label={
                isMoneyMovementExpanded
                  ? 'Collapse money in motion menu'
                  : 'Expand money in motion menu'
              }
              className="mr-2 grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg transition hover:bg-white/10"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isMoneyMovementExpanded
                    ? 'rotate-180'
                    : ''
                }`}
                aria-hidden
              />
            </button>
          </div>

          {isMoneyMovementExpanded && (
            <div className="ml-6 mt-1.5 border-l border-white/15 pl-3">
              <div className="space-y-1">
                {moneyMovementItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end
                      onClick={onNavigate}
                      className={({isActive}) =>
                        [
                          'flex cursor-pointer items-center gap-3',
                          'rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-white/10 font-semibold text-white'
                            : 'text-[#bed2c9] hover:bg-white/5 hover:text-white',
                        ].join(' ')
                      }
                    >
                      <Icon size={15} aria-hidden/>
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {primaryNavigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({isActive}) =>
                [
                  navigationClassName,
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#d5e4dd] hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              <Icon size={18} aria-hidden/>
              {item.label}
            </NavLink>
          )
        })}

        <button
          type="button"
          disabled
          title="Coming in a later module"
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#d5e4dd]/60"
        >
          <Target size={18} aria-hidden/>

          <span className="flex-1">Goals</span>

          <span className="text-[10px] uppercase tracking-wider">
            Soon
          </span>
        </button>
      </nav>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          disabled
          title="Coming in a later module"
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#d5e4dd]/60"
        >
          <Settings size={18} aria-hidden/>
          Settings
        </button>

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/15 px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={18} aria-hidden/>

          {isLoggingOut
            ? 'Signing out…'
            : 'Sign out'}
        </button>

        <div className="mt-5 border-t border-white/15 px-4 pt-5">
          <p className="text-xs leading-5 text-[#bcd9c5]">
            Everything looks steady.
          </p>

          <p className="text-xs font-medium text-white">
            We’re keeping watch.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#173c32]">
      <aside className="fixed inset-y-0 left-0 hidden w-[18.5rem] lg:block">
        <SidebarContent/>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dedbd2] bg-[#f7f5ef]/95 px-5 backdrop-blur lg:hidden">
        <div className="rounded-lg bg-[#174f43] px-2">
          <SalifLogo/>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="cursor-pointer rounded-lg p-2 text-[#173c32] transition hover:bg-[#e7ece7]"
          aria-label="Open navigation"
          aria-expanded={isMenuOpen}
        >
          <Menu size={23} aria-hidden/>
        </button>
      </header>

      <div className="lg:pl-[18.5rem]">
        <Outlet/>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/35"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation"
          />

          <aside className="relative h-full w-[18.5rem] max-w-[85vw] shadow-2xl">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-5 right-4 z-10 cursor-pointer rounded-lg p-2 text-white transition hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X size={21} aria-hidden/>
            </button>

            <SidebarContent
              onNavigate={() => setIsMenuOpen(false)}
            />
          </aside>
        </div>
      )}
    </div>
  )
}