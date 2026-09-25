import {
  ArrowRight,
  Menu,
  X,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useLocation,
} from 'react-router'

import salifLogoGreen from '@/assets/brand/salif-logo-green.svg'
import { useAuth } from '@/features/auth/context/useAuth'

const navigation = [
  {
    label: 'Features',
    hash: 'features',
  },
  {
    label: 'How it helps',
    hash: 'how-it-helps',
  },
  {
    label: 'Security',
    hash: 'security',
  },
  {
    label: 'Support',
    to: '/support',
  },
]

export default function PublicNavbar() {
  const location = useLocation()
  const { status } = useAuth()

  const [
    isCompact,
    setIsCompact,
  ] = useState(false)

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false)

  useEffect(() => {
    function updateHeader() {
      setIsCompact(
        window.scrollY > 32,
      )
    }

    updateHeader()

    window.addEventListener(
      'scroll',
      updateHeader,
      {
        passive: true,
      },
    )

    return () => {
      window.removeEventListener(
        'scroll',
        updateHeader,
      )
    }
  }, [])

  const isAuthenticated =
    status === 'authenticated'

  const primaryDestination =
    isAuthenticated
      ? '/dashboard'
      : '/register'

  const primaryLabel =
    isAuthenticated
      ? 'Open dashboard'
      : 'Start with Salif'

  function hashHref(
    hash: string,
  ) {
    return location.pathname === '/'
      ? `#${hash}`
      : `/#${hash}`
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 motion-reduce:transition-none ${isCompact
        ? 'border-b border-line bg-surface/95 shadow-[0_8px_28px_rgba(0,0,0,0.07)] backdrop-blur-xl'
        : 'border-b border-transparent bg-transparent'
        }`}
    >
      <div
        className={`mx-auto flex max-w-[1240px] items-center justify-between px-5 transition-[height] duration-300 motion-reduce:transition-none sm:px-8 lg:px-12 ${isCompact
          ? 'h-15'
          : 'h-20'
          }`}
      >
        <Link
          to="/"
          aria-label="Salif home"
          className="shrink-0"
        >
          <img
            src={salifLogoGreen}
            alt="Salif"
            className={`h-auto transition-[width] duration-300 ${isCompact
              ? 'w-23 sm:w-25'
              : 'w-27 sm:w-31'
              }`}
          />
        </Link>

        <nav
          aria-label="Public navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navigation.map(
            (item) => {
              const classes =
                `relative py-2 text-sm font-semibold transition ` +
                `after:absolute after:inset-x-0 after:bottom-0 ` +
                `after:h-0.5 after:origin-left after:rounded-full ` +
                `after:bg-accent after:transition-transform`

              if (item.hash) {
                return (
                  <a
                    key={
                      item.hash
                    }
                    href={hashHref(
                      item.hash,
                    )}
                    className={`${classes} text-muted hover:text-ink after:scale-x-0 hover:after:scale-x-100`}
                  >
                    {item.label}
                  </a>
                )
              }

              const isActive =
                location.pathname ===
                item.to

              return (
                <Link
                  key={item.to}
                  to={item.to!}
                  className={`${classes} ${isActive
                    ? 'text-accent after:scale-x-100'
                    : 'text-muted hover:text-ink after:scale-x-0 hover:after:scale-x-100'
                    }`}
                >
                  {item.label}
                </Link>
              )
            },
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="hidden px-3 py-2 text-sm font-semibold text-ink transition hover:text-accent sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          <Link
            to={primaryDestination}
            className={`hidden items-center gap-2 rounded-full bg-primary text-sm font-semibold text-inverse shadow-sm transition-[padding,background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-primary-hover sm:inline-flex ${isCompact
              ? 'px-4 py-2'
              : 'px-5 py-2.5'
              }`}
          >
            {primaryLabel}

            <ArrowRight
              size={16}
              aria-hidden
            />
          </Link>

          <button
            type="button"
            onClick={() =>
              setIsMenuOpen(
                (current) =>
                  !current,
              )
            }
            className="grid size-10 place-items-center rounded-full border border-line bg-surface/60 text-ink backdrop-blur-sm transition hover:bg-surface md:hidden"
            aria-label={
              isMenuOpen
                ? 'Close navigation'
                : 'Open navigation'
            }
            aria-expanded={
              isMenuOpen
            }
          >
            {isMenuOpen ? (
              <X
                size={20}
                aria-hidden
              />
            ) : (
              <Menu
                size={20}
                aria-hidden
              />
            )}
          </button>
        </div>
      </div>

      <div
        className={`grid bg-surface/97 backdrop-blur-xl transition-[grid-template-rows,opacity,border-color] duration-300 md:hidden ${isMenuOpen
          ? 'grid-rows-[1fr] border-t border-line opacity-100'
          : 'pointer-events-none grid-rows-[0fr] border-t border-transparent opacity-0'
          }`}
      >
        <div className="overflow-hidden">
          <nav className="mx-auto max-w-[1240px] px-5 py-4 sm:px-8">
            {navigation.map(
              (item) => {
                if (item.hash) {
                  return (
                    <a
                      key={
                        item.hash
                      }
                      href={hashHref(
                        item.hash,
                      )}
                      onClick={() => setIsMenuOpen(false,)
                      }
                      className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-ink"
                    >
                      {item.label}
                    </a>
                  )
                }

                const isActive = location.pathname === item.to

                return (
                  <Link
                    key={item.to}
                    to={item.to!}
                    onClick={() => setIsMenuOpen(false,)
                    }
                    className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-muted hover:bg-surface-muted hover:text-ink'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              },
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-4">
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink"
                >
                  Sign in
                </Link>
              )}

              <Link
                to={primaryDestination}
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-inverse ${isAuthenticated
                    ? 'col-span-2'
                    : ''
                  }`}
              >
                {primaryLabel}

                <ArrowRight
                  size={15}
                  aria-hidden
                />
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}