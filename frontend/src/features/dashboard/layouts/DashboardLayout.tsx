import {useState, type ComponentType} from 'react'
import {
  ArrowLeftRight,
  LayoutDashboard,
  Landmark,
  LogOut,
  Menu,
  Settings,
  Target,
  X,
} from 'lucide-react'
import {NavLink, Outlet, useNavigate} from 'react-router'
import {useAuth} from '../../auth/context/useAuth'
import {useProfile} from '../../profile/hooks/useProfile'
import salifLogoLight from '../../../assets/brand/salif-logo-light.png'

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

interface DisabledNavigationItem {
  label: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

const upcomingNavigation: DisabledNavigationItem[] = [
  {
    label: 'Money in motion',
    icon: ArrowLeftRight,
  },
  {
    label: 'Accounts',
    icon: Landmark,
  },
  {
    label: 'Goals',
    icon: Target,
  },
]

interface SidebarContentProps {
  onNavigate?: () => void
}

function SidebarContent({
                          onNavigate,
                        }: SidebarContentProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const {data: profile} = useProfile()
  const {logout} = useAuth()
  const navigate = useNavigate()

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'Your account'

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
      .toUpperCase()
    : 'S'

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
    onNavigate?.()
    navigate('/login', {replace: true})
  }

  return (
    <div className="flex h-full flex-col bg-[#174f43] px-5 py-7 text-[#f7f3e9]">
      <div className="px-2">
        <SalifLogo/>
      </div>

      <div className="mt-16 flex items-center gap-3 px-2">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#bcd9c5] text-sm font-bold text-[#174f43]">
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

      <nav className="mt-11 space-y-2" aria-label="Main navigation">
        <NavLink
          to="/dashboard"
          end
          onClick={onNavigate}
          className={({isActive}) =>
            [
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm',
              'font-medium transition-colors',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-[#d5e4dd] hover:bg-white/5 hover:text-white',
            ].join(' ')
          }
        >
          <LayoutDashboard size={19} aria-hidden/>
          Overview
        </NavLink>

        {upcomingNavigation.map(({label, icon: Icon}) => (
          <button
            key={label}
            type="button"
            disabled
            title="Coming in a later module"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#d5e4dd]/70"
          >
            <Icon size={19} aria-hidden/>
            <span className="flex-1">{label}</span>
            <span className="text-[10px] uppercase tracking-wider">
              Soon
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          disabled
          title="Coming in a later module"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#d5e4dd]/70"
        >
          <Settings size={19} aria-hidden/>
          Settings
        </button>

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          <LogOut size={19} aria-hidden/>
          {isLoggingOut ? 'Signing out…' : 'Sign out'}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#173c32]">
      <aside className="fixed inset-y-0 left-0 hidden w-[18.5rem] lg:block">
        <SidebarContent/>
      </aside>

      <header
        className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dedbd2] bg-[#f7f5ef]/95 px-5 backdrop-blur lg:hidden">

        <div className="rounded-lg bg-[#174f43] px-2">
          <SalifLogo />
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="rounded-lg p-2 text-[#173c32] hover:bg-[#e7ece7]"
          aria-label="Open navigation"
          aria-expanded={isMenuOpen}
        >
          <Menu size={23}/>
        </button>
      </header>

      <div className="lg:pl-[18.5rem]">
        <Outlet/>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation"
          />

          <aside className="relative h-full w-[18.5rem] max-w-[85vw] shadow-2xl">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-5 right-4 z-10 rounded-lg p-2 text-white hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X size={21}/>
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
