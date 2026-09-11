import {zodResolver} from '@hookform/resolvers/zod'
import {ChevronDown, LoaderCircle} from 'lucide-react'
import {useMemo, useState} from 'react'
import {useForm} from 'react-hook-form'

import {ApiClientError} from '../../../api/ApiClientError'
import type {UserProfile} from '../api/types'
import {useUpdateProfile} from '../hooks/useProfileMutations'
import {
  profileDetailsSchema,
  type ProfileDetailsFormValues,
} from '../validation/profileSchemas'

interface ProfileDetailsFormProps {
  profile: UserProfile
}

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

function getTimeZones(currentTimeZone: string) {
  const extendedIntl = Intl as typeof Intl & {
    supportedValuesOf?: (
      key: 'timeZone',
    ) => string[]
  }

  const supportedTimeZones =
    extendedIntl.supportedValuesOf?.('timeZone') ??
    fallbackTimeZones

  return Array.from(
    new Set([
      currentTimeZone,
      ...supportedTimeZones,
    ]),
  ).sort()
}

export default function ProfileDetailsForm({
  profile,
}: ProfileDetailsFormProps) {
  const updateProfile = useUpdateProfile()

  const [formError, setFormError] =
    useState<string | null>(null)

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  const timeZones = useMemo(
    () => getTimeZones(profile.timeZone),
    [profile.timeZone],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isDirty},
  } = useForm<ProfileDetailsFormValues>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      timeZone: profile.timeZone,
    },
  })

  async function submitProfile(
    values: ProfileDetailsFormValues,
  ) {
    setFormError(null)
    setSuccessMessage(null)

    try {
      const updatedProfile =
        await updateProfile.mutateAsync({
          version: profile.version,
          firstName: values.firstName,
          lastName: values.lastName,
          timeZone: values.timeZone,
        })

      reset({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        timeZone: updatedProfile.timeZone,
      })

      setSuccessMessage(
        'Your profile details have been updated.',
      )
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to update your profile.',
      )
    }
  }

  const inputClassName =
    'mt-2 w-full rounded-xl border border-[#d9d6cc] ' +
    'bg-[#fffdf8] px-4 py-3 text-sm text-[#173c32] ' +
    'outline-none transition placeholder:text-[#91a099] ' +
    'focus:border-[#5f8f7e] focus:ring-4 focus:ring-[#dce9e2]'

  return (
    <section className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
          PERSONAL DETAILS
        </p>

        <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
          How Salif knows you
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#657972]">
          Keep your name and time zone accurate so
          dates, schedules and greetings feel natural.
        </p>
      </div>

      <form
        className="mt-8"
        onSubmit={handleSubmit(submitProfile)}
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#294e43]">
            First name

            <input
              {...register('firstName')}
              autoComplete="given-name"
              className={inputClassName}
            />

            {errors.firstName && (
              <span className="mt-2 block text-xs font-medium text-[#ad573e]">
                {errors.firstName.message}
              </span>
            )}
          </label>

          <label className="text-sm font-semibold text-[#294e43]">
            Last name

            <input
              {...register('lastName')}
              autoComplete="family-name"
              className={inputClassName}
            />

            {errors.lastName && (
              <span className="mt-2 block text-xs font-medium text-[#ad573e]">
                {errors.lastName.message}
              </span>
            )}
          </label>
        </div>

        <label className="mt-5 block text-sm font-semibold text-[#294e43]">
          Time zone

          <span className="relative block">
            <select
              {...register('timeZone')}
              className={`${inputClassName} cursor-pointer appearance-none pr-12`}
            >
              {timeZones.map((timeZone) => (
                <option
                  key={timeZone}
                  value={timeZone}
                >
                  {timeZone.replaceAll('_', ' ')}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 text-[#657972]"
            />
          </span>

          {errors.timeZone && (
            <span className="mt-2 block text-xs font-medium text-[#ad573e]">
              {errors.timeZone.message}
            </span>
          )}
        </label>

        {formError && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-[#f8e8e1] px-4 py-3 text-sm text-[#8d432f]"
          >
            {formError}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-[#e2eee7] px-4 py-3 text-sm text-[#245b49]"
          >
            {successMessage}
          </p>
        )}

        <div className="mt-7 flex justify-end">
          <button
            type="submit"
            disabled={
              !isDirty ||
              updateProfile.isPending
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#174f43] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#103d34] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateProfile.isPending && (
              <LoaderCircle
                size={17}
                className="animate-spin"
                aria-hidden
              />
            )}

            {updateProfile.isPending
              ? 'Saving'
              : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}