import {zodResolver} from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  X,
} from 'lucide-react'
import {useState} from 'react'
import {
  useForm,
  type UseFormRegisterReturn,
} from 'react-hook-form'

import {ApiClientError} from '../../../api/ApiClientError'
import {useChangePassword} from '../hooks/useProfileMutations'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../validation/profileSchemas'

interface ChangePasswordFormProps {
  onPasswordChanged: () => void
}

interface PasswordFieldProps {
  label: string
  autoComplete: string
  visible: boolean
  disabled: boolean
  error?: string
  inputProps: UseFormRegisterReturn
  onToggle: () => void
}

const inputClassName =
  'w-full rounded-xl border border-[#d9d6cc] bg-white px-4 py-3 pr-12 text-sm ' +
  'text-[#173c32] outline-none transition focus:border-[#5f8f7e] focus:ring-4 ' +
  'focus:ring-[#dce9e2] disabled:cursor-not-allowed disabled:opacity-60'

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
    <label className="block text-sm font-semibold text-[#294e43]">
      {label}

      <span className="relative mt-2 block">
        <input
          {...inputProps}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          className={inputClassName}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#657972] hover:bg-[#edf2ee] hover:text-[#174f43]"
        >
          {visible ? (
            <EyeOff size={18} aria-hidden/>
          ) : (
            <Eye size={18} aria-hidden/>
          )}
        </button>
      </span>

      {error && (
        <span className="mt-2 block text-xs font-medium text-[#ad573e]">
          {error}
        </span>
      )}
    </label>
  )
}

export default function ChangePasswordForm({
  onPasswordChanged,
}: ChangePasswordFormProps) {
  const changePassword = useChangePassword()
  const [isOpen, setIsOpen] = useState(false)
  const [formError, setFormError] =
    useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false)
  const [showNewPassword, setShowNewPassword] =
    useState(false)
  const [showConfirmation, setShowConfirmation] =
    useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  function closeDialog() {
    if (changePassword.isPending) {
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
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      form.reset()
      setIsOpen(false)
      onPasswordChanged()
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to change your password.',
      )
    }
  }

  return (
    <>
      <section className="flex h-full flex-col rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e2eee7] text-[#276754]">
            <KeyRound size={20} aria-hidden/>
          </span>

          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              PASSWORD
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#173c32]">
              Keep your sign-in private
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#657972]">
          Update your password if it is old, reused or
          no longer feels secure.
        </p>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="cursor-pointer rounded-full border border-[#174f43] px-5 py-2.5 text-sm font-semibold text-[#174f43] transition hover:bg-[#174f43] hover:text-white"
          >
            Change password
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102c25]/65 p-5 backdrop-blur-sm"
        >
          <div className="relative my-auto w-full max-w-lg rounded-3xl border border-white/20 bg-[#fffdf8] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              aria-label="Close change password dialog"
              disabled={changePassword.isPending}
              onClick={closeDialog}
              className="absolute right-5 top-5 grid size-9 cursor-pointer place-items-center rounded-full text-[#657972] transition hover:bg-[#edf2ee] hover:text-[#173c32] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} aria-hidden/>
            </button>

            <span className="grid size-12 place-items-center rounded-2xl bg-[#e2eee7] text-[#276754]">
              <KeyRound size={22} aria-hidden/>
            </span>

            <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-[#657972]">
              SIGN-IN SECURITY
            </p>

            <h2
              id="change-password-title"
              className="mt-3 pr-10 font-serif text-3xl text-[#173c32]"
            >
              Change your password
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#657972]">
              Salif will sign you out of every device
              after your password changes.
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={form.handleSubmit(submitPassword)}
              noValidate
            >
              <PasswordField
                label="Current password"
                autoComplete="current-password"
                visible={showCurrentPassword}
                disabled={changePassword.isPending}
                error={
                  form.formState.errors.currentPassword
                    ?.message
                }
                inputProps={form.register(
                  'currentPassword',
                )}
                onToggle={() =>
                  setShowCurrentPassword(
                    (current) => !current,
                  )
                }
              />

              <PasswordField
                label="New password"
                autoComplete="new-password"
                visible={showNewPassword}
                disabled={changePassword.isPending}
                error={
                  form.formState.errors.newPassword
                    ?.message
                }
                inputProps={form.register('newPassword')}
                onToggle={() =>
                  setShowNewPassword(
                    (current) => !current,
                  )
                }
              />

              <PasswordField
                label="Confirm new password"
                autoComplete="new-password"
                visible={showConfirmation}
                disabled={changePassword.isPending}
                error={
                  form.formState.errors.confirmPassword
                    ?.message
                }
                inputProps={form.register(
                  'confirmPassword',
                )}
                onToggle={() =>
                  setShowConfirmation(
                    (current) => !current,
                  )
                }
              />

              <p className="text-xs leading-5 text-[#657972]">
                Use 12–72 characters with uppercase,
                lowercase, a number and a special
                character.
              </p>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#f8e8e1] px-4 py-3 text-sm text-[#8d432f]"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={changePassword.isPending}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#174f43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#103d34] disabled:cursor-not-allowed disabled:opacity-50"
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
            </form>
          </div>
        </div>
      )}
    </>
  )
}