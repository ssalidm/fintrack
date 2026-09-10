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
  'w-full rounded-xl border border-[#d9d6cc] bg-white px-4 py-3 pr-12 text-sm ' +
  'text-[#173c32] outline-none transition focus:border-[#5f8f7e] focus:ring-4 ' +
  'focus:ring-[#dce9e2] disabled:cursor-not-allowed disabled:opacity-60'

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
      <div className="relative my-auto w-full max-w-lg rounded-3xl border border-white/20 bg-[#fffdf8] p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          aria-label="Close disable two-factor authentication dialog"
          disabled={disableMfa.isPending}
          onClick={onClose}
          className="absolute right-5 top-5 grid size-9 cursor-pointer place-items-center rounded-full text-[#657972] transition hover:bg-[#edf2ee] hover:text-[#173c32] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} aria-hidden />
        </button>

        <span className="grid size-12 place-items-center rounded-2xl bg-[#f5e5dd] text-[#ad573e]">
          <AlertTriangle
            size={22}
            aria-hidden
          />
        </span>

        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-[#ad573e]">
          REDUCE ACCOUNT SECURITY
        </p>

        <h2
          id="disable-mfa-title"
          className="mt-3 pr-10 font-serif text-3xl text-[#173c32]"
        >
          Disable two-factor authentication?
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#657972]">
          Your account will return to
          password-only sign-in, and all current
          recovery codes will stop working.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={form.handleSubmit(submit)}
          noValidate
        >
          <label className="block text-sm font-semibold text-[#294e43]">
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
                className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#657972] hover:bg-[#edf2ee] hover:text-[#174f43]"
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
              <span className="mt-2 block text-xs font-medium text-[#ad573e]">
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
              className="block text-center text-sm font-semibold text-[#294e43]"
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
                className="mt-2 text-center text-xs font-medium text-[#ad573e]"
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
              className="rounded-xl bg-[#f8e8e1] px-4 py-3 text-sm text-[#8d432f]"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={disableMfa.isPending}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ad573e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#91442f] disabled:cursor-not-allowed disabled:opacity-50"
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