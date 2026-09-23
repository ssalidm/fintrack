import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  Eye,
  EyeOff,
  LoaderCircle,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  Controller,
  useForm,
} from 'react-hook-form'

import { ApiClientError } from '../../../api/ApiClientError'
import OtpCodeInput from '../../auth/components/OtpCodeInput'
import { useDisableMfa } from '../hooks/useMfaManagement'
import {
  disableMfaSchema,
  type DisableMfaFormValues,
} from '../validation/profileSchemas'

interface MfaDisableDialogProps {
  onClose: () => void
  onDisabled: () => void
}

const passwordInputClasses =
  'w-full rounded-xl border border-line bg-white px-4 py-3 pr-12 text-sm ' +
  'text-ink outline-none transition focus:border-accent focus:ring-4 ' +
  'focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60'

export default function MfaDisableDialog({
  onClose,
  onDisabled,
}: MfaDisableDialogProps) {
  const disableMfa = useDisableMfa()

  const [showPassword, setShowPassword] =
    useState(false)

  const [formError, setFormError] =
    useState<string | null>(null)

  const form = useForm<DisableMfaFormValues>({
    resolver: zodResolver(disableMfaSchema),
    defaultValues: {
      currentPassword: '',
      mfaCode: '',
    },
  })

  async function submit(
    values: DisableMfaFormValues,
  ) {
    setFormError(null)

    try {
      await disableMfa.mutateAsync({
        currentPassword:
          values.currentPassword,
        mfaCode: values.mfaCode.trim(),
      })

      onDisabled()
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to disable two-factor authentication.',
      )
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disable-mfa-title"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102c25]/65 p-5 backdrop-blur-sm"
    >
      <div className="relative my-auto w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          aria-label="Close disable two-factor authentication dialog"
          disabled={disableMfa.isPending}
          onClick={onClose}
          className="absolute right-5 top-5 grid size-9 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} aria-hidden />
        </button>

        <span className="grid size-12 place-items-center rounded-2xl bg-danger-soft text-danger">
          <AlertTriangle
            size={22}
            aria-hidden
          />
        </span>

        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-danger">
          REDUCE ACCOUNT SECURITY
        </p>

        <h2
          id="disable-mfa-title"
          className="mt-3 pr-10 font-serif text-3xl text-ink"
        >
          Disable two-factor authentication?
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted">
          Your account will return to
          password-only sign-in, and all current
          recovery codes will stop working.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={form.handleSubmit(submit)}
          noValidate
        >
          <label className="block text-sm font-semibold text-ink">
            Current password

            <span className="relative mt-2 block">
              <input
                {...form.register(
                  'currentPassword',
                )}
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                disabled={disableMfa.isPending}
                className={passwordInputClasses}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                aria-label={
                  showPassword
                    ? 'Hide current password'
                    : 'Show current password'
                }
                className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface-muted hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                    aria-hidden
                  />
                ) : (
                  <Eye
                    size={18}
                    aria-hidden
                  />
                )}
              </button>
            </span>

            {form.formState.errors
              .currentPassword && (
              <span className="mt-2 block text-xs font-medium text-danger">
                {
                  form.formState.errors
                    .currentPassword.message
                }
              </span>
            )}
          </label>

          <div>
            <label
              htmlFor="disableMfaCode"
              className="block text-center text-sm font-semibold text-ink"
            >
              Authenticator code
            </label>

            <div className="mt-3">
              <Controller
                name="mfaCode"
                control={form.control}
                render={({ field }) => (
                  <OtpCodeInput
                    id="disableMfaCode"
                    name={field.name}
                    value={field.value}
                    disabled={
                      disableMfa.isPending
                    }
                    invalid={Boolean(
                      form.formState.errors
                        .mfaCode,
                    )}
                    describedBy={
                      form.formState.errors
                        .mfaCode
                        ? 'disable-mfa-code-error'
                        : undefined
                    }
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {form.formState.errors.mfaCode && (
              <p
                id="disable-mfa-code-error"
                role="alert"
                className="mt-2 text-center text-xs font-medium text-danger"
              >
                {
                  form.formState.errors.mfaCode
                    .message
                }
              </p>
            )}
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={disableMfa.isPending}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-danger px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disableMfa.isPending && (
              <LoaderCircle
                size={17}
                className="animate-spin"
                aria-hidden
              />
            )}

            {disableMfa.isPending
              ? 'Disabling'
              : 'Disable protection'}
          </button>
        </form>
      </div>
    </div>
  )
}