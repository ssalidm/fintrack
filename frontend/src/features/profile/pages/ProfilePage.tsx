import {
  useCallback,
  useRef,
  useState,
} from 'react'

import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import { useAuth } from '../../auth/context/useAuth'
import ChangePasswordForm from '../components/ChangePasswordForm'
import PasswordChangedDialog from '../components/PasswordChangedDialog'
import ProfileDetailsForm from '../components/ProfileDetailsForm'
import TwoFactorAuthenticationCard from '../components/TwoFactorAuthenticationCard'
import { useProfile } from '../hooks/useProfile'
import ChangeEmailForm from '../components/ChangeEmailForm'
import PageShell from '../../../components/layout/PageShell'

function formatDate(value: string | null) {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^\w/, (letter) =>
      letter.toUpperCase(),
    )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [passwordChanged, setPasswordChanged] =
    useState(false)

  const signOutStarted = useRef(false)

  const {
    data: profile,
    error,
    isPending,
  } = useProfile()

  function handlePasswordChanged() {
    setPasswordChanged(true)
  }

  const finishPasswordChange = useCallback(
    async () => {
      if (signOutStarted.current) {
        return
      }

      signOutStarted.current = true

      await logout().catch(() => undefined)

      navigate('/login', {
        replace: true,
        state: {
          message:
            'Password changed successfully. Sign in with your new password.',
        },
      })
    },
    [logout, navigate],
  )

  if (isPending) {
    return (
      <PageShell>
        <div className="animate-pulse">
          <div className="h-3 w-32 rounded bg-[#dfe5df]" />

          <div className="mt-5 h-14 w-72 rounded bg-[#dfe5df]" />

          <div className="mt-10 h-40 rounded-3xl bg-[#e7ebe6]" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="h-[430px] rounded-3xl bg-[#e7ebe6]" />

            <div className="h-[330px] rounded-3xl bg-[#e7ebe6]" />
          </div>
        </div>
      </PageShell>
    )
  }

  if (!profile || error) {
    const message =
      error instanceof ApiClientError
        ? error.message
        : 'Unable to load your profile.'

    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="max-w-md text-center">
          <p className="font-serif text-3xl text-[#173c32]">
            We couldn’t open your profile
          </p>

          <p className="mt-3 text-sm leading-6 text-[#657972]">
            {message}
          </p>
        </div>
      </main>
    )
  }

  const displayName =
    `${profile.firstName} ${profile.lastName}`

  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
      .toUpperCase()

  return (
    <PageShell>
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
          YOUR ACCOUNT
        </p>

        <h1 className="mt-5 font-serif text-4xl leading-none tracking-[-0.03em] text-[#173c32] sm:text-5xl lg:text-6xl">
          Profile &amp; Security
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#657972]">
          Manage the personal details and
          security protecting your Salif
          account.
        </p>
      </header>

      <section className="mt-10 overflow-hidden rounded-3xl bg-[#174f43] text-white">
        <div className="grid gap-7 p-7 sm:p-9 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid size-20 place-items-center rounded-full bg-[#bcd9c5] font-serif text-3xl text-[#174f43]">
            {initials}
          </span>

          <div>
            <p className="font-serif text-3xl">
              {displayName}
            </p>

            <p className="mt-2 flex items-center gap-2 text-sm text-[#cfe0d8]">
              <Mail size={15} aria-hidden />
              {profile.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">
              <ShieldCheck
                size={15}
                aria-hidden
              />

              {formatStatus(profile.status)}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#d8b56d]/20 px-4 py-2 text-xs font-semibold text-[#f1d79d]">
              <BadgeCheck
                size={15}
                aria-hidden
              />

              {profile.emailVerified
                ? 'Email verified'
                : 'Email unverified'}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <ProfileDetailsForm
          key={profile.version}
          profile={profile}
        />

        <aside className="rounded-3xl border border-[#dedbd2] bg-[#f0f3ec] p-6 sm:p-7">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            ACCOUNT NOTES
          </p>

          <h2 className="mt-3 font-serif text-2xl text-[#173c32]">
            A little context
          </h2>

          <div className="mt-7 space-y-6">
            <div className="flex gap-3">
              <CalendarDays
                size={19}
                className="mt-0.5 shrink-0 text-[#4f806f]"
                aria-hidden
              />

              <div>
                <p className="text-sm font-semibold text-[#294e43]">
                  Salif member since
                </p>

                <p className="mt-1 text-sm text-[#657972]">
                  {formatDate(
                    profile.createdAt,
                  )}
                </p>
              </div>
            </div>

            <div className="border-t border-[#d8ddd6]" />

            <div className="flex gap-3">
              <Clock3
                size={19}
                className="mt-0.5 shrink-0 text-[#4f806f]"
                aria-hidden
              />

              <div>
                <p className="text-sm font-semibold text-[#294e43]">
                  Last signed in
                </p>

                <p className="mt-1 text-sm text-[#657972]">
                  {formatDate(
                    profile.lastLoginAt,
                  )}
                </p>
              </div>
            </div>

            <div className="border-t border-[#d8ddd6]" />

            <div className="flex gap-3">
              <BadgeCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#4f806f]"
                aria-hidden
              />

              <div>
                <p className="text-sm font-semibold text-[#294e43]">
                  Account access
                </p>

                <p className="mt-1 text-sm text-[#657972]">
                  {profile.roles
                    .map((role) =>
                      role.replace(
                        'ROLE_',
                        '',
                      ),
                    )
                    .join(', ')}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6">
        <TwoFactorAuthenticationCard />
      </div>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
        <ChangeEmailForm currentEmail={profile.email} />

        <ChangePasswordForm
          onPasswordChanged={handlePasswordChanged}
        />
      </div>

      {passwordChanged && (
        <PasswordChangedDialog
          onContinue={finishPasswordChange}
        />
      )}
    </PageShell>
  )
}