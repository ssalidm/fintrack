import {zodResolver} from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import {useState} from 'react'
import {useForm} from 'react-hook-form'

import {ApiClientError} from '../../../api/ApiClientError'
import {useChangePassword} from '../hooks/useProfileMutations'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../validation/profileSchemas'

interface ChangePasswordFormProps {
  onPasswordChanged: () => void
}

export default function ChangePasswordForm({
  onPasswordChanged,
}: ChangePasswordFormProps) {
  const changePassword = useChangePassword()

  const [formError, setFormError] =
    useState<string | null>(null)

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false)

  const [showNewPassword, setShowNewPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function submitPassword(
    values: ChangePasswordFormValues,
  ) {
    setFormError(null)

    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to change your password.',
      )

      return
    }

    reset()
    onPasswordChanged()
  }

  const inputClassName =
    'w-full rounded-xl border border-[#d9d6cc] ' +
    'bg-[#fffdf8] px-4 py-3 pr-12 text-sm text-[#173c32] ' +
    'outline-none transition focus:border-[#5f8f7e] ' +
    'focus:ring-4 focus:ring-[#dce9e2]'

  return (
    <section className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-8">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e2eee7] text-[#276754]">
          <ShieldCheck size={21} aria-hidden/>
        </span>

        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            SECURITY
          </p>

          <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
            Change your password
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#657972]">
            Salif will sign you out of every device
            after your password changes.
          </p>
        </div>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(submitPassword)}
        noValidate
      >
        <label className="block text-sm font-semibold text-[#294e43]">
          Current password

          <span className="relative mt-2 block">
            <input
              {...register('currentPassword')}
              type={
                showCurrentPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="current-password"
              className={inputClassName}
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(
                  (current) => !current,
                )
              }
              aria-label={
                showCurrentPassword
                  ? 'Hide current password'
                  : 'Show current password'
              }
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#657972] hover:bg-[#edf2ee] hover:text-[#174f43]"
            >
              {showCurrentPassword
                ? <EyeOff size={18}/>
                : <Eye size={18}/>}
            </button>
          </span>

          {errors.currentPassword && (
            <span className="mt-2 block text-xs font-medium text-[#ad573e]">
              {errors.currentPassword.message}
            </span>
          )}
        </label>

        <label className="block text-sm font-semibold text-[#294e43]">
          New password

          <span className="relative mt-2 block">
            <input
              {...register('newPassword')}
              type={
                showNewPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              className={inputClassName}
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(
                  (current) => !current,
                )
              }
              aria-label={
                showNewPassword
                  ? 'Hide new password'
                  : 'Show new password'
              }
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#657972] hover:bg-[#edf2ee] hover:text-[#174f43]"
            >
              {showNewPassword
                ? <EyeOff size={18}/>
                : <Eye size={18}/>}
            </button>
          </span>

          {errors.newPassword && (
            <span className="mt-2 block text-xs font-medium text-[#ad573e]">
              {errors.newPassword.message}
            </span>
          )}
        </label>

        <label className="block text-sm font-semibold text-[#294e43]">
          Confirm new password

          <span className="relative mt-2 block">
            <input
              {...register('confirmPassword')}
              type={
                showConfirmPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              className={inputClassName}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (current) => !current,
                )
              }
              aria-label={
                showConfirmPassword
                  ? 'Hide confirmed password'
                  : 'Show confirmed password'
              }
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#657972] hover:bg-[#edf2ee] hover:text-[#174f43]"
            >
              {showConfirmPassword
                ? <EyeOff size={18}/>
                : <Eye size={18}/>}
            </button>
          </span>

          {errors.confirmPassword && (
            <span className="mt-2 block text-xs font-medium text-[#ad573e]">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        <p className="text-xs leading-5 text-[#657972]">
          Use 12–72 characters with uppercase,
          lowercase, a number and a special character.
        </p>

        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-[#f8e8e1] px-4 py-3 text-sm text-[#8d432f]"
          >
            {formError}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#174f43] px-6 py-3 text-sm font-semibold text-[#174f43] transition hover:bg-[#174f43] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changePassword.isPending && (
              <LoaderCircle
                size={17}
                className="animate-spin"
                aria-hidden
              />
            )}

            {changePassword.isPending
              ? 'Changing password'
              : 'Change password'}
          </button>
        </div>
      </form>
    </section>
  )
}