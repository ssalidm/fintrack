import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  LoaderCircle,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  useForm,
  type UseFormRegisterReturn,
} from 'react-hook-form'

import { ApiClientError } from '@/api/ApiClientError'
import { useChangePassword } from '@/features/profile/hooks/useProfileMutations'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/profile/validation/profileSchemas'
import { formatDate } from '@/utils/dateFormatter'

interface ChangePasswordFormProps {
  readonly passwordChangedAt: string | null
  readonly onPasswordChanged: () => void
}

interface PasswordFieldProps {
  readonly label: string
  readonly autoComplete: string
  readonly visible: boolean
  readonly disabled: boolean
  readonly error?: string
  readonly inputProps: UseFormRegisterReturn
  readonly onToggle: () => void
}

const inputClassName = `
  h-10
  w-full
  rounded-md
  border border-line
  bg-surface
  px-3.5
  pr-12
  text-sm
  text-ink
  outline-none
  transition
  focus:border-accent
  focus:ring-2
  focus:ring-accent/15
  disabled:cursor-not-allowed
  disabled:opacity-60
`

function PasswordField({
  label,
  autoComplete,
  visible,
  disabled,
  error,
  inputProps,
  onToggle,
}: PasswordFieldProps) {
  return (
    <label className="type-label block">
      {label}

      <span className="relative mt-2 block">
        <input
          {...inputProps}
          type={
            visible
              ? 'text'
              : 'password'
          }
          autoComplete={
            autoComplete
          }
          disabled={
            disabled
          }
          className={
            inputClassName
          }
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          className="
            absolute
            right-2 top-1/2
            grid size-8
            -translate-y-1/2
            place-items-center
            rounded-md
            text-muted
            transition
            hover:bg-surface-muted
            hover:text-ink
          "
        >
          {visible ? (
            <EyeOff
              size={17}
              aria-hidden
            />
          ) : (
            <Eye
              size={17}
              aria-hidden
            />
          )}
        </button>
      </span>

      {error && (
        <span className="mt-1.5 block text-xs font-medium text-danger">
          {error}
        </span>
      )}
    </label>
  )
}

function formatPasswordChangedAt(
  value: string | null,
) {
  if (!value) {
    return 'Password change history not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Password change history not available'
  }

  return `Last changed — ${formatDate(value, true)}`
}

const passwordBtnClass = "rounded-full border border-line-strong bg-surface" +
              " px-3 py-1.5 text-xs font-semibold text-ink transition" +
              " hover:border-accent  hover:text-accent"

export default function ChangePasswordForm({
  passwordChangedAt,
  onPasswordChanged,
}: ChangePasswordFormProps) {
  const changePassword =
    useChangePassword()

  const [
    isOpen,
    setIsOpen,
  ] = useState(false)

  const [
    formError,
    setFormError,
  ] = useState<string | null>(
    null,
  )

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false)

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false)

  const form =
    useForm<ChangePasswordFormValues>({
      resolver: zodResolver(
        changePasswordSchema,
      ),
      defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    })

  function closeDialog() {
    if (
      changePassword.isPending
    ) {
      return
    }

    form.reset()
    setFormError(null)
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmation(false)
    setIsOpen(false)
  }

  async function submitPassword(
    values: ChangePasswordFormValues,
  ) {
    setFormError(null)

    try {
      await changePassword.mutateAsync({
        currentPassword:
          values.currentPassword,
        newPassword:
          values.newPassword,
      })

      form.reset()
      setIsOpen(false)
      onPasswordChanged()
    } catch (error) {
      setFormError(
        error instanceof
          ApiClientError
          ? error.message
          : 'Unable to change your password.',
      )
    }
  }

  return (
    <>
      <div
        className="
          grid
          gap-3
          py-4
          md:grid-cols-[180px_minmax(0,1fr)_auto]
          md:items-center
          md:gap-8
        "
      >
        <p className="text-sm font-medium text-muted">
          Password
        </p>

        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-ink">
            ••••••••••••
          </p>

          <p className="mt-1 text-xs text-subtle">
            {formatPasswordChangedAt(
              passwordChangedAt
            )}
          </p>
        </div>

        <div className="flex min-w-[86px] md:justify-end">
          <button
            type="button"
            onClick={() =>
              setIsOpen(true)
            }
            className={passwordBtnClass}
          >
            Change
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          className="
            feature-fade-in
            fixed inset-0 z-50
            grid place-items-center
            overflow-y-auto
            bg-[#102c25]/65
            p-5
            backdrop-blur-sm
          "
        >
          <div
            className="
              relative
              my-auto
              w-full
              max-w-lg
              rounded-2xl
              border border-line
              bg-surface
              p-6
              shadow-2xl
              sm:p-8
            "
          >
            <button
              type="button"
              aria-label="Close change password dialog"
              disabled={
                changePassword.isPending
              }
              onClick={
                closeDialog
              }
              className="
                absolute
                right-5 top-5
                grid size-9
                place-items-center
                rounded-full
                text-muted
                transition
                hover:bg-surface-muted
                hover:text-ink
                disabled:opacity-50
              "
            >
              <X
                size={18}
                aria-hidden
              />
            </button>

            <p className="type-eyebrow">
              Sign-in security
            </p>

            <h2
              id="change-password-title"
              className="type-section-title mt-2 pr-10"
            >
              Change your password
            </h2>

            <p className="type-body mt-2">
              Salif will sign you out of every device after your password changes.
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={
                form.handleSubmit(
                  submitPassword,
                )
              }
              noValidate
            >
              <PasswordField
                label="Current password"
                autoComplete="current-password"
                visible={
                  showCurrentPassword
                }
                disabled={
                  changePassword.isPending
                }
                error={
                  form.formState
                    .errors
                    .currentPassword
                    ?.message
                }
                inputProps={
                  form.register(
                    'currentPassword',
                  )
                }
                onToggle={() =>
                  setShowCurrentPassword(
                    (current) =>
                      !current,
                  )
                }
              />

              <PasswordField
                label="New password"
                autoComplete="new-password"
                visible={
                  showNewPassword
                }
                disabled={
                  changePassword.isPending
                }
                error={
                  form.formState
                    .errors
                    .newPassword
                    ?.message
                }
                inputProps={
                  form.register(
                    'newPassword',
                  )
                }
                onToggle={() =>
                  setShowNewPassword(
                    (current) =>
                      !current,
                  )
                }
              />

              <PasswordField
                label="Confirm new password"
                autoComplete="new-password"
                visible={
                  showConfirmation
                }
                disabled={
                  changePassword.isPending
                }
                error={
                  form.formState
                    .errors
                    .confirmPassword
                    ?.message
                }
                inputProps={
                  form.register(
                    'confirmPassword',
                  )
                }
                onToggle={() =>
                  setShowConfirmation(
                    (current) =>
                      !current,
                  )
                }
              />

              <p className="type-caption">
                Use 12–72 characters with uppercase, lowercase, a number and a special character.
              </p>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  changePassword.isPending
                }
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-primary
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  transition
                  hover:bg-primary-hover
                  disabled:opacity-50
                "
              >
                {changePassword.isPending && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                    aria-hidden
                  />
                )}

                {changePassword.isPending
                  ? 'Changing password…'
                  : 'Change password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}