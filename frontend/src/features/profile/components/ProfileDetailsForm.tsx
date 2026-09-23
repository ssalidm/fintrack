import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '../../../api/ApiClientError'
import type { UserProfile } from '../api/types'
import { useUpdateProfile } from '../hooks/useProfileMutations'
import {
  profileDetailsSchema,
  type ProfileDetailsFormValues,
} from '../validation/profileSchemas'
import SettingsList from '../../../components/settings/SettingsList'

interface ProfileDetailsFormProps {
  readonly profile: UserProfile
  readonly children?: React.ReactNode
}

type EditableField =
  | 'name'
  | 'preferredName'
  | 'timeZone'
  | null

const fallbackTimeZones = [
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/New_York',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Europe/London',
  'Europe/Paris',
  'UTC',
]

function getTimeZones(
  currentTimeZone: string,
) {
  const extendedIntl =
    Intl as typeof Intl & {
      supportedValuesOf?: (
        key: 'timeZone',
      ) => string[]
    }

  const supportedTimeZones =
    extendedIntl.supportedValuesOf?.(
      'timeZone',
    ) ?? fallbackTimeZones

  return Array.from(
    new Set([
      currentTimeZone,
      ...supportedTimeZones,
    ]),
  ).sort()
}

export default function ProfileDetailsForm({
  profile,
  children,
}: ProfileDetailsFormProps) {
  const updateProfile =
    useUpdateProfile()

  const [
    editing,
    setEditing,
  ] = useState<EditableField>(null)

  const [
    formError,
    setFormError,
  ] = useState<string | null>(
    null,
  )

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  )

  const timeZones = useMemo(
    () =>
      getTimeZones(
        profile.timeZone,
      ),
    [profile.timeZone],
  )

  const form =
    useForm<ProfileDetailsFormValues>({
      resolver: zodResolver(
        profileDetailsSchema,
      ),
      defaultValues: {
        firstName:
          profile.firstName,
        lastName:
          profile.lastName,
        preferredName:
          profile.preferredName ??
          '',
        timeZone:
          profile.timeZone,
      },
    })

  function resetForm() {
    form.reset({
      firstName:
        profile.firstName,
      lastName:
        profile.lastName,
      preferredName:
        profile.preferredName ??
        '',
      timeZone:
        profile.timeZone,
    })
  }

  function startEditing(
    field: Exclude<
      EditableField,
      null
    >,
  ) {
    resetForm()
    setFormError(null)
    setSuccessMessage(null)
    setEditing(field)
  }

  function cancelEditing() {
    if (
      updateProfile.isPending
    ) {
      return
    }

    resetForm()
    setFormError(null)
    setEditing(null)
  }

  async function saveProfile(
    values: ProfileDetailsFormValues,
  ) {
    setFormError(null)
    setSuccessMessage(null)

    try {
      await updateProfile.mutateAsync({
        version:
          profile.version,
        firstName:
          values.firstName,
        lastName:
          values.lastName,
        preferredName:
          values.preferredName.trim(),
        timeZone:
          values.timeZone,
      })

      setEditing(null)

      setSuccessMessage(
        'Changes saved.',
      )
    } catch (error) {
      setFormError(
        error instanceof
          ApiClientError
          ? error.message
          : 'Unable to update your profile.',
      )
    }
  }

  const inputClassName = `
    h-9
    w-full
    rounded-md
    border border-line
    bg-surface
    px-3
    text-sm
    font-medium
    text-ink
    outline-none
    transition
    placeholder:text-subtle
    focus:border-accent
    focus:ring-2
    focus:ring-accent/15
    disabled:opacity-60
  `

  return (
    <section>
      <div>
        <h2 className="type-section-title">
          Personal information
        </h2>

        <p className="type-body mt-1">
          Keep your account details
          accurate and choose how Salif
          addresses you.
        </p>
      </div>

      <SettingsList className="mt-5">
        <SettingsRow
          label="Full name"
          editing={
            editing === 'name'
          }
          saving={
            updateProfile.isPending
          }
          onEdit={() =>
            startEditing('name')
          }
          onCancel={
            cancelEditing
          }
          onSave={form.handleSubmit(
            saveProfile,
          )}
          value={`${profile.firstName} ${profile.lastName}`}
        >
          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <div>
              <input
                {...form.register(
                  'firstName',
                )}
                type="text"
                autoComplete="given-name"
                aria-label="First name"
                autoFocus
                className={
                  inputClassName
                }
              />

              {form.formState.errors
                .firstName && (
                  <FieldError>
                    {
                      form.formState
                        .errors.firstName
                        .message
                    }
                  </FieldError>
                )}
            </div>

            <div>
              <input
                {...form.register(
                  'lastName',
                )}
                type="text"
                autoComplete="family-name"
                aria-label="Last name"
                className={
                  inputClassName
                }
              />

              {form.formState.errors
                .lastName && (
                  <FieldError>
                    {
                      form.formState
                        .errors.lastName
                        .message
                    }
                  </FieldError>
                )}
            </div>
          </div>
        </SettingsRow>

        <SettingsRow
          label="Preferred name"
          editing={
            editing ===
            'preferredName'
          }
          saving={
            updateProfile.isPending
          }
          onEdit={() =>
            startEditing(
              'preferredName',
            )
          }
          onCancel={
            cancelEditing
          }
          onSave={form.handleSubmit(
            saveProfile,
          )}
          value={
            profile.preferredName?.trim() ||
            'Not set'
          }
        >
          <div className="max-w-sm">
            <input
              {...form.register(
                'preferredName',
              )}
              type="text"
              autoComplete="nickname"
              aria-label="Preferred name"
              placeholder="What should Salif call you?"
              autoFocus
              className={
                inputClassName
              }
            />

            {form.formState.errors
              .preferredName && (
                <FieldError>
                  {
                    form.formState
                      .errors
                      .preferredName
                      .message
                  }
                </FieldError>
              )}
          </div>
        </SettingsRow>

        <SettingsRow
          label="Time zone"
          editing={
            editing ===
            'timeZone'
          }
          saving={
            updateProfile.isPending
          }
          onEdit={() =>
            startEditing(
              'timeZone',
            )
          }
          onCancel={
            cancelEditing
          }
          onSave={form.handleSubmit(
            saveProfile,
          )}
          value={profile.timeZone.replaceAll(
            '_',
            ' ',
          )}
        >
          <div className="max-w-sm">
            <select
              {...form.register(
                'timeZone',
              )}
              aria-label="Time zone"
              autoFocus
              className={`${inputClassName} cursor-pointer`}
            >
              {timeZones.map(
                (timeZone) => (
                  <option
                    key={
                      timeZone
                    }
                    value={
                      timeZone
                    }
                  >
                    {timeZone.replaceAll(
                      '_',
                      ' ',
                    )}
                  </option>
                ),
              )}
            </select>

            {form.formState.errors
              .timeZone && (
                <FieldError>
                  {
                    form.formState
                      .errors.timeZone
                      .message
                  }
                </FieldError>
              )}
          </div>
        </SettingsRow>

        {children}
      </SettingsList>

      {formError && (
        <p
          role="alert"
          className="mt-3 text-sm font-medium text-danger"
        >
          {formError}
        </p>
      )}

      {successMessage && (
        <p
          role="status"
          className="mt-3 text-sm font-medium text-success"
        >
          {successMessage}
        </p>
      )}
    </section>
  )
}

interface SettingsRowProps {
  readonly label: string
  readonly value: string
  readonly editing: boolean
  readonly saving: boolean
  readonly children: React.ReactNode
  readonly onEdit: () => void
  readonly onCancel: () => void
  readonly onSave: () => void
}

function SettingsRow({
  label,
  value,
  editing,
  saving,
  children,
  onEdit,
  onCancel,
  onSave,
}: SettingsRowProps) {
  return (
    <div
      className="
        grid
        gap-3
        py-5
        md:grid-cols-[180px_minmax(0,1fr)_auto]
        md:items-center
        md:gap-8
      "
    >
      <p className="text-sm font-medium text-muted">
        {label}
      </p>

      <div className="min-w-0">
        {editing ? (
          children
        ) : (
          <p
            className={
              value === 'Not set'
                ? 'text-sm text-subtle'
                : 'text-sm font-medium text-ink'
            }
          >
            {value}
          </p>
        )}
      </div>

      <div className="flex min-w-[86px] items-center gap-2 md:justify-end">
        {editing ? (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-md
                border border-primary
                bg-primary
                px-3 py-1.5
                text-xs font-semibold
                text-white
                transition
                hover:bg-primary-hover
                disabled:opacity-50
              "
            >
              {saving ? (
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                  aria-hidden
                />
              ) : (
                <Check
                  size={14}
                  aria-hidden
                />
              )}

              {saving
                ? 'Saving'
                : 'Save'}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={
                onCancel
              }
              aria-label={`Cancel editing ${label}`}
              className="
                grid size-8
                place-items-center
                rounded-3xl
                text-white
                transition
                bg-red-500
                hover:bg-red-600
                disabled:opacity-50
              "
            >
              <X
                size={15}
                aria-hidden
              />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="
              rounded-md
              border border-line-strong
              bg-surface
              px-3 py-1.5
              text-xs font-semibold
              text-ink
              transition
              hover:border-accent
              hover:text-accent
            "
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

function FieldError({
  children,
}: {
  readonly children:
  React.ReactNode
}) {
  return (
    <p className="mt-1.5 text-xs font-medium text-danger">
      {children}
    </p>
  )
}