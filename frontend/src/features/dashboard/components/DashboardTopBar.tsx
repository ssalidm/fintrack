import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router'

import { useAuth } from '@/features/auth/context/useAuth'
import ProfileAvatar from '@/features/profile/components/ProfileAvatar'
import { useProfile } from '@/features/profile/hooks/useProfile'
import useDashboardNotifications from '@/features/dashboard/hooks/useDashboardNotifications'
import DashboardCalendarMenu from './DashboardCalendarMenu'

function routeTitle(
  pathname: string,
) {
  if (pathname === '/dashboard') {
    return 'Overview'
  }

  if (
    pathname.startsWith(
      '/transactions',
    )
  ) {
    return 'Transactions'
  }

  if (
    pathname.startsWith(
      '/transfers',
    )
  ) {
    return 'Transfers'
  }

  if (
    pathname.startsWith(
      '/recurring',
    )
  ) {
    return 'Recurring'
  }

  if (
    pathname.startsWith(
      '/accounts',
    )
  ) {
    return 'Accounts'
  }

  if (
    pathname.startsWith(
      '/categories',
    )
  ) {
    return 'Categories'
  }

  if (
    pathname.startsWith(
      '/budgets',
    )
  ) {
    return 'Budgets'
  }

  if (
    pathname.startsWith(
      '/goals',
    )
  ) {
    return 'Goals'
  }

  if (
    pathname.startsWith(
      '/profile',
    )
  ) {
    return 'Account settings'
  }

  if (
    pathname.startsWith(
      '/admin/users/',
    )
  ) {
    return 'User details'
  }

  if (
    pathname.startsWith(
      '/admin/users',
    )
  ) {
    return 'User management'
  }

  return 'Salif'
}

export default function DashboardTopBar() {
  const location =
    useLocation()

  const navigate =
    useNavigate()

  const { data: profile } =
    useProfile()

  const { logout } =
    useAuth()

  const notifications =
    useDashboardNotifications()

  const [
    isNotificationOpen,
    setIsNotificationOpen,
  ] = useState(false)

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false)

  const [
    isCalendarOpen,
    setIsCalendarOpen,
  ] = useState(false)

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false)

  const topBarRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(
      event: MouseEvent,
    ) {
      if (
        !topBarRef.current?.contains(
          event.target as Node,
        )
      ) {
        setIsNotificationOpen(false)
        setIsProfileOpen(false)
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      )
    }
  }, [])

  const displayName =
    profile?.preferredName?.trim() ||
    profile?.firstName?.trim() ||
    'Salif user'

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()

      navigate('/login', {
        replace: true,
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div
      ref={topBarRef}
      className="
        sticky top-0
        z-100
        mx-0 mt-0
        hidden
        lg:block
        xl:mx-8
      "
    >
      <header
        className="
          flex h-16
          items-center
          justify-between
          rounded-bl-2xl
          rounded-br-2xl
          border border-line/50
          bg-surface/50
          px-5
          shadow-[0_10px_30px_rgba(23,60,50,0.05)]
          backdrop-blur-xl
          xl:px-6
        "
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">
            Salif
          </p>

          <h1 className="mt-0.5 truncate text-base font-semibold text-ink">
            {routeTitle(
              location.pathname,
            )}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <DashboardCalendarMenu
            isOpen={isCalendarOpen}
            onToggle={() => {
              setIsCalendarOpen(
                (current) =>
                  !current,
              )

              setIsNotificationOpen(false)
              setIsProfileOpen(false)
            }}
            onClose={() =>
              setIsCalendarOpen(false)
            }
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationOpen(
                  (current) =>
                    !current,
                )

                setIsProfileOpen(false)
                setIsCalendarOpen(false)
              }}
              aria-label="Open notifications"
              aria-expanded={
                isNotificationOpen
              }
              className="
                relative
                grid size-10
                cursor-pointer
                place-items-center
                rounded-full
                border border-line/50
                bg-app/70
                text-muted
                transition
                hover:border-accent/50
                hover:text-primary
              "
            >
              <Bell
                size={17}
                aria-hidden
              />

              {notifications.total >
                0 && (
                <span
                  className="
                    absolute
                    -right-1 -top-1
                    grid min-w-4
                    place-items-center
                    rounded-full
                    bg-danger
                    px-1
                    text-[9px]
                    font-bold
                    leading-4
                    text-inverse
                    ring-2 ring-surface
                  "
                >
                  {
                    notifications.total
                  }
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div
                className="
                  absolute
                  right-0 top-12
                  w-[330px]
                  overflow-hidden
                  rounded-2xl
                  border border-line/60
                  bg-surface
                  shadow-[0_20px_55px_rgba(23,60,50,0.16)]
                "
              >
                <div className="border-b border-line/50 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Notifications
                      </p>

                      <p className="mt-0.5 text-xs text-muted">
                        Payments that may
                        need your
                        attention.
                      </p>
                    </div>

                    {notifications.total >
                      0 && (
                      <span
                        className="
                          rounded-full
                          bg-accent-soft
                          px-2 py-1
                          text-[10px]
                          font-semibold
                          text-accent
                        "
                      >
                        {
                          notifications.total
                        }{' '}
                        new
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2">
                  {notifications.dueCount >
                    0 && (
                    <Link
                      to="/recurring"
                      onClick={() =>
                        setIsNotificationOpen(
                          false,
                        )
                      }
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        px-3 py-3
                        transition
                        hover:bg-danger-soft/60
                      "
                    >
                      <span
                        className="
                          grid size-9
                          shrink-0
                          place-items-center
                          rounded-lg
                          bg-danger-soft
                          text-danger
                        "
                      >
                        <AlertTriangle
                          size={16}
                          aria-hidden
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">
                          {
                            notifications.dueCount
                          }{' '}
                          recurring{' '}
                          {notifications.dueCount ===
                          1
                            ? 'payment needs'
                            : 'payments need'}{' '}
                          attention
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted">
                          Review overdue
                          or due recurring
                          payments.
                        </p>
                      </div>
                    </Link>
                  )}

                  {notifications.upcomingCount >
                    0 && (
                    <Link
                      to="/recurring"
                      onClick={() =>
                        setIsNotificationOpen(
                          false,
                        )
                      }
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        px-3 py-3
                        transition
                        hover:bg-accent-soft/60
                      "
                    >
                      <span
                        className="
                          grid size-9
                          shrink-0
                          place-items-center
                          rounded-lg
                          bg-accent-soft
                          text-accent
                        "
                      >
                        <CalendarClock
                          size={16}
                          aria-hidden
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">
                          {
                            notifications.upcomingCount
                          }{' '}
                          upcoming{' '}
                          {notifications.upcomingCount ===
                          1
                            ? 'payment'
                            : 'payments'}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted">
                          Scheduled in the
                          next 7 days.
                        </p>
                      </div>
                    </Link>
                  )}

                  {notifications.total ===
                    0 && (
                    <div className="px-3 py-7 text-center">
                      <span
                        className="
                          mx-auto
                          grid size-10
                          place-items-center
                          rounded-full
                          bg-success-soft
                          text-success
                        "
                      >
                        <Bell
                          size={17}
                          aria-hidden
                        />
                      </span>

                      <p className="mt-3 text-sm font-semibold text-ink">
                        You&apos;re all
                        caught up
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted">
                        No payment
                        reminders need
                        your attention
                        right now.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-line/50 px-4 py-3">
                  <Link
                    to="/recurring"
                    onClick={() =>
                      setIsNotificationOpen(
                        false,
                      )
                    }
                    className="text-xs font-semibold text-accent transition hover:text-primary"
                  >
                    View recurring
                    payments
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(
                  (current) =>
                    !current,
                )

                setIsNotificationOpen(
                  false,
                )
                setIsCalendarOpen(false)
              }}
              aria-label="Open account menu"
              aria-expanded={
                isProfileOpen
              }
              className="
                flex
                cursor-pointer
                items-center
                gap-2
                rounded-full
                border border-line/50
                bg-app/70
                p-1.5
                pr-2
                transition
                hover:border-accent/50
              "
            >
              <ProfileAvatar
                profile={profile}
                className="size-8 rounded-full text-[11px]"
              />

              <ChevronDown
                size={14}
                className="text-subtle"
                aria-hidden
              />
            </button>

            {isProfileOpen && (
              <div
                className="
                  absolute
                  right-0 top-12
                  w-56
                  overflow-hidden
                  rounded-2xl
                  border border-line/60
                  bg-surface/98
                  p-2
                  shadow-[0_20px_55px_rgba(23,60,50,0.16)]
                "
              >
                <div className="border-b border-line/50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      profile={profile}
                      className="size-9 rounded-full text-[11px]"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {displayName}
                      </p>

                      <p className="mt-0.5 text-xs text-muted">
                        Personal account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1.5">
                  <Link
                    to="/profile"
                    onClick={() =>
                      setIsProfileOpen(
                        false,
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3 py-2.5
                      text-sm font-medium
                      text-ink
                      transition
                      hover:bg-surface-muted
                    "
                  >
                    <Settings
                      size={16}
                      className="text-muted"
                      aria-hidden
                    />

                    Account settings
                  </Link>

                  <button
                    type="button"
                    disabled={
                      isLoggingOut
                    }
                    onClick={() =>
                      void handleLogout()
                    }
                    className="
                      flex w-full
                      cursor-pointer
                      items-center
                      gap-3
                      rounded-xl
                      px-3 py-2.5
                      text-left
                      text-sm font-medium
                      text-danger
                      transition
                      hover:bg-danger-soft
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <LogOut
                      size={16}
                      aria-hidden
                    />

                    {isLoggingOut
                      ? 'Signing out…'
                      : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
