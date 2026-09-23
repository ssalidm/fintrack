import {
  useCallback,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router'

import { ApiClientError } from '../api/ApiClientError'
import PageHeader from '../components/layout/PageHeader'
import PageShell from '../components/layout/PageShell'
import SettingsList from '../components/settings/SettingsList'
import { useAuth } from '../features/auth/context/useAuth'
import ChangeEmailForm from '../features/profile/components/ChangeEmailForm'
import ChangePasswordForm from '../features/profile/components/ChangePasswordForm'
import PasswordChangedDialog from '../features/profile/components/PasswordChangedDialog'
import ProfileAvatarEditor from '../features/profile/components/ProfileAvatarEditor'
import ProfileDetailsForm from '../features/profile/components/ProfileDetailsForm'
import ProfileSessions from '../features/profile/components/ProfileSessions'
import TwoFactorAuthenticationCard from '../features/profile/components/TwoFactorAuthenticationCard'
import { useProfile } from '../features/profile/hooks/useProfile'
import { formatDate } from '../utils/dateFormatter'

function formatStatus(
  status: string,
) {
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(
      /^\w/,
      (letter) =>
        letter.toUpperCase(),
    )
}

export default function ProfilePage() {
  const navigate =
    useNavigate()

  const { logout } =
    useAuth()

  const [
    passwordChanged,
    setPasswordChanged,
  ] = useState(false)

  const signOutStarted =
    useRef(false)

  const {
    data: profile,
    error,
    isPending,
  } = useProfile()

  const finishPasswordChange =
    useCallback(async () => {
      if (
        signOutStarted.current
      ) {
        return
      }

      signOutStarted.current =
        true

      await logout().catch(
        () => undefined,
      )

      navigate(
        '/login',
        {
          replace: true,
          state: {
            message:
              'Password changed successfully. Sign in with your new password.',
          },
        },
      )
    }, [
      logout,
      navigate,
    ])

  if (isPending) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-[1040px] animate-pulse">
          <div className="h-3 w-32 rounded bg-surface-strong" />

          <div className="mt-4 h-12 w-80 max-w-full rounded bg-surface-strong" />

          <div className="mt-10 space-y-5">
            <div className="h-16 rounded bg-surface-strong" />
            <div className="h-16 rounded bg-surface-strong" />
            <div className="h-16 rounded bg-surface-strong" />
          </div>
        </div>
      </PageShell>
    )
  }

  if (
    !profile ||
    error
  ) {
    const message =
      error instanceof
      ApiClientError
        ? error.message
        : 'Unable to load your profile.'

    return (
      <PageShell>
        <div className="mx-auto max-w-xl py-20 text-center">
          <h1 className="type-page-title">
            We couldn’t open your profile
          </h1>

          <p className="type-body mt-3">
            {message}
          </p>
        </div>
      </PageShell>
    )
  }

  const fullName =
    `${profile.firstName} ${profile.lastName}`

  const verificationStatus =
    profile.emailVerified
      ? 'Email verified'
      : 'Email unverified'

  return (
    <PageShell>
      <PageHeader
        eyebrow="Profile & Security"
        title="Account Settings"
        description="Manage your personal information, sign-in details and account security."
      />

      <section
        className="
          feature-reveal
          feature-reveal-delay-1
          mt-7
          flex
          flex-col
          gap-5
          rounded-2xl
          border border-line/40
          bg-[#17634898]/25
          p-6
          sm:flex-row
          sm:items-center
          sm:p-7
        "
      >
        <ProfileAvatarEditor
          profile={profile}
        />

        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
            {fullName}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span>
              Member since{' '}
              —{' '}
              {formatDate(
                profile.createdAt,
              )}
            </span>
          </div>
        </div>
      </section>

      <section
        className="
          feature-reveal
          feature-reveal-delay-2
          mt-10
          rounded-2xl
          border border-line/40
          bg-surface/25
          p-6
          sm:p-7
        "
      >
        <ProfileDetailsForm
          key={profile.version}
          profile={profile}
        >
          <ChangeEmailForm
            currentEmail={
              profile.email
            }
          />
        </ProfileDetailsForm>
      </section>

      <section
        className="
          feature-reveal
          feature-reveal-delay-2
          mt-8
          rounded-2xl
          border border-line/40
          bg-surface/25
          p-6
          sm:p-7
        "
      >
        <SectionHeader
          title="Security"
          description="Manage how you sign in and protect your Salif account."
        />

        <SettingsList className="mt-5">
          <ChangePasswordForm
            passwordChangedAt={
              profile.passwordChangedAt
            }
            onPasswordChanged={() =>
              setPasswordChanged(
                true,
              )
            }
          />

          <TwoFactorAuthenticationCard />
        </SettingsList>
      </section>

      <section
        className="
          feature-reveal
          feature-reveal-delay-3
          mt-8
          rounded-2xl
          border border-line/40
          bg-danger/4
          p-6
          sm:p-7
        "
      >
        <SectionHeader
          title="Sessions"
          description="Review the devices currently signed in to your Salif account."
        />

        <ProfileSessions />
      </section>

      <section
        className="
          feature-reveal
          feature-reveal-delay-3
          mt-8
          rounded-2xl
          border border-line/40
          bg-surface/25
          p-6
          sm:p-7
        "
      >
        <SectionHeader
          title="Account"
          description="General information about your Salif account."
        />

        <SettingsList className="mt-5">
          <AccountRow
            label="Status"
            value={formatStatus(
              profile.status,
            )}
          />

          <AccountRow
            label="Verification"
            value={
              verificationStatus
            }
          />
        </SettingsList>
      </section>

      {passwordChanged && (
        <PasswordChangedDialog
          onContinue={
            finishPasswordChange
          }
        />
      )}
    </PageShell>
  )
}

interface SectionHeaderProps {
  readonly title: string
  readonly description: string
}

function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div>
      <h2 className="type-section-title">
        {title}
      </h2>

      <p className="type-body mt-1">
        {description}
      </p>
    </div>
  )
}

interface AccountRowProps {
  readonly label: string
  readonly value: string
}

function AccountRow({
  label,
  value,
}: AccountRowProps) {
  return (
    <div
      className="
        grid
        gap-1
        py-5
        sm:grid-cols-[180px_minmax(0,1fr)]
        sm:items-center
        sm:gap-8
      "
    >
      <p className="text-sm font-medium text-muted">
        {label}
      </p>

      <p className="text-sm font-medium text-ink">
        {value}
      </p>
    </div>
  )
}
