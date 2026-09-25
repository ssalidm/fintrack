import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  Copy,
  LoaderCircle,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  Controller,
  useForm,
} from 'react-hook-form'
import QRCode from 'react-qr-code'

import { ApiClientError } from '@/api/ApiClientError'
import OtpCodeInput from '@/features/auth/components/OtpCodeInput'
import type { MfaSetup } from '@/features/profile/api/types'
import { useConfirmMfaSetup } from '../hooks/useMfaManagement'
import {
  confirmMfaSetupSchema,
  type ConfirmMfaSetupFormValues,
} from '@/features/profile/validation/profileSchemas'
import RecoveryCodesPanel from './RecoveryCodesPanel'

interface MfaSetupDialogProps {
  setup: MfaSetup
  onClose: () => void
  onEnabled: () => void
}

export default function MfaSetupDialog({
  setup,
  onClose,
  onEnabled,
}: MfaSetupDialogProps) {
  const confirmSetup = useConfirmMfaSetup()

  const [formError, setFormError] =
    useState<string | null>(null)

  const [keyCopied, setKeyCopied] =
    useState(false)

  const [recoveryCodes, setRecoveryCodes] =
    useState<readonly string[] | null>(null)

  const form =
    useForm<ConfirmMfaSetupFormValues>({
      resolver: zodResolver(
        confirmMfaSetupSchema,
      ),
      defaultValues: {
        code: '',
      },
    })

  async function copyManualKey() {
    try {
      await navigator.clipboard.writeText(
        setup.manualEntryKey,
      )

      setKeyCopied(true)
    } catch {
      setKeyCopied(false)
    }
  }

  async function submit(
    values: ConfirmMfaSetupFormValues,
  ) {
    setFormError(null)

    try {
      const response =
        await confirmSetup.mutateAsync({
          code: values.code.trim(),
        })

      setRecoveryCodes(response.recoveryCodes)
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to confirm two-factor authentication.',
      )
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        recoveryCodes
          ? undefined
          : 'mfa-setup-title'
      }
      aria-label={
        recoveryCodes
          ? 'Save recovery codes'
          : undefined
      }
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102c25]/65 p-5 backdrop-blur-sm"
    >
      <div className="relative my-auto w-full max-w-xl rounded-3xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
        {recoveryCodes ? (
          <RecoveryCodesPanel
            codes={recoveryCodes}
            onDone={onEnabled}
            completionLabel="Finish setup"
          />
        ) : (
          <>
            <button
              type="button"
              aria-label="Close two-factor setup"
              disabled={confirmSetup.isPending}
              onClick={onClose}
              className="absolute right-5 top-5 grid size-9 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-[#edf2ee] hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} aria-hidden />
            </button>

            <p className="text-xs font-semibold tracking-[0.15em] text-accent">
              TWO-FACTOR AUTHENTICATION
            </p>

            <h2
              id="mfa-setup-title"
              className="mt-3 pr-10 font-serif text-3xl text-ink"
            >
              Connect your authenticator
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted">
              Scan this QR code with your
              authenticator app, then enter the
              six-digit code it generates.
            </p>

            <div className="mt-6 grid items-center gap-6 rounded-2xl bg-surface-muted p-5 sm:grid-cols-[190px_1fr]">
              <div className="mx-auto rounded-2xl bg-white p-4 shadow-sm">
                <QRCode
                  value={setup.otpAuthUri}
                  size={158}
                  level="M"
                  title="Salif authenticator setup QR code"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">
                  Can’t scan the code?
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Enter this setup key manually in
                  your authenticator app.
                </p>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-surface p-2 pl-3">
                  <code className="min-w-0 flex-1 break-all font-mono text-xs font-semibold text-ink">
                    {setup.manualEntryKey}
                  </code>

                  <button
                    type="button"
                    onClick={copyManualKey}
                    className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-accent transition hover:bg-surface-muted"
                    aria-label="Copy manual setup key"
                  >
                    {keyCopied ? (
                      <Check
                        size={17}
                        aria-hidden
                      />
                    ) : (
                      <Copy
                        size={17}
                        aria-hidden
                      />
                    )}
                  </button>
                </div>

                <p
                  aria-live="polite"
                  className="mt-2 min-h-4 text-xs text-accent"
                >
                  {keyCopied
                    ? 'Setup key copied.'
                    : ''}
                </p>
              </div>
            </div>

            <form
              className="mt-6"
              onSubmit={form.handleSubmit(submit)}
              noValidate
            >
              <label
                htmlFor="mfaSetupCode"
                className="block text-center text-sm font-semibold text-ink"
              >
                Authenticator code
              </label>

              <div className="mt-3">
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field }) => (
                    <OtpCodeInput
                      id="mfaSetupCode"
                      name={field.name}
                      value={field.value}
                      disabled={
                        confirmSetup.isPending
                      }
                      invalid={Boolean(
                        form.formState.errors.code,
                      )}
                      describedBy={
                        form.formState.errors.code
                          ? 'mfa-setup-code-error'
                          : undefined
                      }
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {form.formState.errors.code && (
                <p
                  id="mfa-setup-code-error"
                  role="alert"
                  className="mt-2 text-center text-xs font-medium text-danger"
                >
                  {
                    form.formState.errors.code
                      .message
                  }
                </p>
              )}

              {formError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={confirmSetup.isPending}
                className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirmSetup.isPending && (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                    aria-hidden
                  />
                )}

                {confirmSetup.isPending
                  ? 'Confirming'
                  : 'Confirm and enable'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}