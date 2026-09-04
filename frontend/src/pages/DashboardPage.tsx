import {
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router'
import salifLogo from '../assets/brand/salif-logo-dark.png'
import { ApiClientError } from '../api/ApiClientError'
import { useAuth } from '../features/auth/context/useAuth'
import { useAuthenticatedRequest } from '../features/auth/hooks/useAuthenticatedRequest'
import type { UserProfile } from '../features/profile/api/types'

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const request = useAuthenticatedRequest()
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()

    async function loadProfile() {
      setLoadError(null)
      setProfile(null)

      try {
        const response = await request<UserProfile>('/profile', {
          signal: controller.signal,
        })

        setProfile(response.data)
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          return
        }

        setLoadError(
          error instanceof ApiClientError
            ? error.message
            : 'Unable to load your profile.',
        )
      }
    }

    void loadProfile()

    return () => {
      controller.abort()
    }
  }, [request, reloadKey])

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-6">
          <img
            src={salifLogo}
            className="h-10 w-auto"
            alt="Salif"
          />

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </header>

        {loadError && (
          <section
            className="mt-16 rounded-2xl border border-red-200 bg-red-50 p-8"
            role="alert"
          >
            <h1 className="text-2xl font-semibold text-red-900">
              We couldn’t load your profile
            </h1>

            <p className="mt-2 text-red-700">{loadError}</p>

            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-5 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
            >
              Try again
            </button>
          </section>
        )}

        {!profile && !loadError && (
          <section
            className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            aria-busy="true"
          >
            <div
              className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#1F7A5C]"
              aria-hidden="true"
            />

            <p className="mt-4 text-slate-600">
              Loading your profile…
            </p>
          </section>
        )}

        {profile && (
          <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-[#1F7A5C]">
              Authentication successful
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Welcome, {profile.firstName}
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              Your Salif session is active and your profile was loaded
              securely from the backend.
            </p>

            <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {profile.email}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-slate-500">Time zone</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {profile.timeZone}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-slate-500">Status</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {profile.status}
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </main>
  )
}
