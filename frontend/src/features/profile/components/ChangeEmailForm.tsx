import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  Controller,
  useForm,
} from 'react-hook-form'

import { ApiClientError } from '../../../api/ApiClientError'
import OtpCodeInput from '../../auth/components/OtpCodeInput'
import {
  formatCooldown,
  useRequestCooldown,
} from '../../auth/hooks/useRequestCooldown'
import { useMfaStatus } from '../hooks/useMfaManagement'
import { useChangeEmail } from '../hooks/useProfileMutations'
import {
  changeEmailSchema,
  type ChangeEmailFormValues,
} from '../validation/profileSchemas'

interface ChangeEmailFormProps {
  currentEmail: string
}

const EMAIL_CHANGE_COOLDOWN_KEY =
  'salif:cooldown:email-change'

const inputClassName = `
  h-10
  w-full
  rounded-md
  border border-line
  bg-surface
  px-3.5
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

export default function ChangeEmailForm({
  currentEmail,
}: ChangeEmailFormProps) {
  const changeEmail =
    useChangeEmail()

  const mfaStatus =
    useMfaStatus()

  const cooldown =
    useRequestCooldown(
      EMAIL_CHANGE_COOLDOWN_KEY,
    )

  const [
    isOpen,
    setIsOpen,
  ] = useState(false)

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    formError,
    setFormError,
  ] = useState<string | null>(
    null,
  )

  const [
    requestedEmail,
    setRequestedEmail,
  ] = useState<string | null>(
    null,
  )

  const form =
    useForm<ChangeEmailFormValues>({
      resolver: zodResolver(
        changeEmailSchema,
      ),
      defaultValues: {
        newEmail: '',
        currentPassword: '',
        mfaCode: '',
      },
    })

  const mfaEnabled =
    Boolean(
      mfaStatus.data?.enabled,
    )

  function closeDialog() {
    if (
      changeEmail.isPending
    ) {
      return
    }

    form.reset()
    setFormError(null)
    setRequestedEmail(null)
    setShowPassword(false)
    setIsOpen(false)
  }

  async function openDialog() {
    if (
      mfaStatus.isError
    ) {
      const result =
        await mfaStatus.refetch()

      if (result.isError) {
        return
      }
    }

    setIsOpen(true)
  }

  async function submitEmail(
    values: ChangeEmailFormValues,
  ) {
    setFormError(null)

    if (
      cooldown.isCoolingDown
    ) {
      setFormError(
        `You can request another email change in ${formatCooldown(
          cooldown.remainingSeconds,
        )}.`,
      )

      return
    }

    const newEmail =
      values.newEmail.trim()

    const mfaCode =
      values.mfaCode.trim()

    if (
      newEmail.toLowerCase() ===
      currentEmail.toLowerCase()
    ) {
      form.setError(
        'newEmail',
        {
          type: 'manual',
          message:
            'Enter an email address different from your current one',
        },
      )

      return
    }

    if (
      mfaEnabled &&
      !/^\d{6}$/.test(
        mfaCode,
      )
    ) {
      form.setError(
        'mfaCode',
        {
          type: 'manual',
          message:
            'Enter the 6-digit code from your authenticator app',
        },
      )

      return
    }

    try {
      await changeEmail.mutateAsync({
        newEmail,
        currentPassword:
          values.currentPassword,
        ...(mfaEnabled
          ? { mfaCode }
          : {}),
      })

      form.reset()
      cooldown.startCooldown()
      setRequestedEmail(
        newEmail,
      )
    } catch (error) {
      setFormError(
        error instanceof
          ApiClientError
          ? error.message
          : 'Unable to request an email address change.',
      )
    }
  }

  return (
    <>
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
          Email
        </p>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">
            {currentEmail}
          </p>

          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-success-soft
              px-2 py-0.5
              text-[11px]
              font-semibold
              text-success
            "
          >
            <CheckCircle2
              size={12}
              aria-hidden
            />

            Verified
          </span>
        </div>

        <div className="flex min-w-[86px] md:justify-end">
          <button
            type="button"
            disabled={
              mfaStatus.isPending
            }
            onClick={
              openDialog
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-1.5
              rounded-full
              border border-line-strong
              bg-surface
              px-3 py-1.5
              text-xs
              font-semibold
              text-ink
              transition
              hover:border-accent
              hover:text-accent
              disabled:opacity-50
            "
          >
            {mfaStatus.isPending && (
              <LoaderCircle
                size={14}
                className="animate-spin"
                aria-hidden
              />
            )}

            {mfaStatus.isError
              ? 'Check again'
              : 'Change'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-email-title"
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
              aria-label="Close change email dialog"
              disabled={
                changeEmail.isPending
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

            {requestedEmail ? (
              <div>
                <span className="grid size-10 place-items-center rounded-full bg-success-soft text-success">
                  <CheckCircle2
                    size={20}
                    aria-hidden
                  />
                </span>

                <p className="type-eyebrow mt-5">
                  Check your inbox
                </p>

                <h2
                  id="change-email-title"
                  className="type-section-title mt-2 pr-10"
                >
                  Confirm your new email
                </h2>

                <p className="type-body mt-3">
                  We sent a verification
                  link to{' '}
                  <strong className="font-semibold text-ink">
                    {requestedEmail}
                  </strong>
                  . Your current address
                  remains active until you
                  confirm the new one.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    disabled={
                      cooldown.isCoolingDown
                    }
                    onClick={() =>
                      setRequestedEmail(
                        null,
                      )
                    }
                    className="
                      flex w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border border-line-strong
                      px-5 py-2.5
                      text-sm font-semibold
                      text-ink
                      transition
                      hover:border-accent
                      hover:text-accent
                      disabled:opacity-50
                    "
                  >
                    {cooldown.isCoolingDown &&
                      (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                          aria-hidden
                        />
                      )}

                    {cooldown.isCoolingDown
                      ? `Request another change in ${formatCooldown(
                          cooldown.remainingSeconds,
                        )}`
                      : 'Request another change'}
                  </button>

                  <button
                    type="button"
                    onClick={
                      closeDialog
                    }
                    className="
                      w-full
                      rounded-full
                      bg-primary
                      px-5 py-2.5
                      text-sm font-semibold
                      text-white
                      transition
                      hover:bg-primary-hover
                    "
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="type-eyebrow">
                  Account contact
                </p>

                <h2
                  id="change-email-title"
                  className="type-section-title mt-2 pr-10"
                >
                  Change your email address
                </h2>

                <p className="type-body mt-2">
                  Verify the new address
                  before it becomes your
                  Salif sign-in email.
                  Confirming the change will
                  close your active sessions.
                </p>

                <form
                  className="mt-6 space-y-5"
                  onSubmit={
                    form.handleSubmit(
                      submitEmail,
                    )
                  }
                  noValidate
                >
                  {cooldown.isCoolingDown && (
                    <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm text-muted">
                      Another request will
                      be available in{' '}
                      <strong className="text-ink">
                        {formatCooldown(
                          cooldown.remainingSeconds,
                        )}
                      </strong>
                      .
                    </p>
                  )}

                  <label className="type-label block">
                    New email address

                    <input
                      {...form.register(
                        'newEmail',
                      )}
                      type="email"
                      autoComplete="email"
                      disabled={
                        changeEmail.isPending
                      }
                      className={`mt-2 ${inputClassName}`}
                    />

                    {form.formState
                      .errors
                      .newEmail && (
                      <span className="mt-1.5 block text-xs font-medium text-danger">
                        {
                          form.formState
                            .errors
                            .newEmail
                            .message
                        }
                      </span>
                    )}
                  </label>

                  <label className="type-label block">
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
                        disabled={
                          changeEmail.isPending
                        }
                        className={`${inputClassName} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (
                              current,
                            ) =>
                              !current,
                          )
                        }
                        aria-label={
                          showPassword
                            ? 'Hide current password'
                            : 'Show current password'
                        }
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
                        {showPassword ? (
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

                    {form.formState
                      .errors
                      .currentPassword && (
                      <span className="mt-1.5 block text-xs font-medium text-danger">
                        {
                          form.formState
                            .errors
                            .currentPassword
                            .message
                        }
                      </span>
                    )}
                  </label>

                  {mfaEnabled && (
                    <div className="rounded-xl bg-surface-muted p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <ShieldCheck
                          size={16}
                          aria-hidden
                        />

                        Authenticator confirmation
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted">
                        Enter the current
                        six-digit code from
                        your authenticator
                        app.
                      </p>

                      <div className="mt-4">
                        <Controller
                          name="mfaCode"
                          control={
                            form.control
                          }
                          render={({
                            field,
                          }) => (
                            <OtpCodeInput
                              id="changeEmailMfaCode"
                              name={
                                field.name
                              }
                              value={
                                field.value
                              }
                              disabled={
                                changeEmail.isPending
                              }
                              invalid={Boolean(
                                form
                                  .formState
                                  .errors
                                  .mfaCode,
                              )}
                              describedBy={
                                form
                                  .formState
                                  .errors
                                  .mfaCode
                                  ? 'change-email-mfa-error'
                                  : undefined
                              }
                              inputRef={
                                field.ref
                              }
                              onBlur={
                                field.onBlur
                              }
                              onChange={
                                field.onChange
                              }
                            />
                          )}
                        />
                      </div>

                      {form.formState
                        .errors
                        .mfaCode && (
                        <p
                          id="change-email-mfa-error"
                          role="alert"
                          className="mt-2 text-center text-xs font-medium text-danger"
                        >
                          {
                            form
                              .formState
                              .errors
                              .mfaCode
                              .message
                          }
                        </p>
                      )}
                    </div>
                  )}

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
                      changeEmail.isPending ||
                      cooldown.isCoolingDown
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
                    {changeEmail.isPending && (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                        aria-hidden
                      />
                    )}

                    {changeEmail.isPending
                      ? 'Sending verification…'
                      : cooldown.isCoolingDown
                        ? `Available in ${formatCooldown(
                            cooldown.remainingSeconds,
                          )}`
                        : 'Send verification link'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}