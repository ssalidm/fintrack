import {zodResolver} from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react'
import {useState} from 'react'
import {
  Controller,
  useForm,
} from 'react-hook-form'

import {ApiClientError} from '../../../api/ApiClientError'
import OtpCodeInput from '../../auth/components/OtpCodeInput'
import {
  formatCooldown,
  useRequestCooldown,
} from '../../auth/hooks/useRequestCooldown'
import {useMfaStatus} from '../hooks/useMfaManagement'
import {useChangeEmail} from '../hooks/useProfileMutations'
import {
  changeEmailSchema,
  type ChangeEmailFormValues,
} from '../validation/profileSchemas'

interface ChangeEmailFormProps {
  currentEmail: string
}

const EMAIL_CHANGE_COOLDOWN_KEY =
  'salif:cooldown:email-change'

const inputClassName =
  'w-full rounded-xl border border-[#d9d6cc] bg-white px-4 py-3 text-sm ' +
  'text-[#173c32] outline-none transition focus:border-[#5f8f7e] focus:ring-4 ' +
  'focus:ring-[#dce9e2] disabled:cursor-not-allowed disabled:opacity-60'

export default function ChangeEmailForm({
  currentEmail,
}: ChangeEmailFormProps) {
  const changeEmail = useChangeEmail()
  const mfaStatus = useMfaStatus()

  const cooldown = useRequestCooldown(
    EMAIL_CHANGE_COOLDOWN_KEY,
  )

  const [isOpen, setIsOpen] =
    useState(false)

  const [showPassword, setShowPassword] =
    useState(false)

  const [formError, setFormError] =
    useState<string | null>(null)

  const [requestedEmail, setRequestedEmail] =
    useState<string | null>(null)

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      currentPassword: '',
      mfaCode: '',
    },
  })

  const mfaEnabled = Boolean(
    mfaStatus.data?.enabled,
  )

  function closeDialog() {
    if (changeEmail.isPending) {
      return
    }

    form.reset()
    setFormError(null)
    setRequestedEmail(null)
    setShowPassword(false)
    setIsOpen(false)
  }

  async function openDialog() {
    if (mfaStatus.isError) {
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

    if (cooldown.isCoolingDown) {
      setFormError(
        `You can request another email change in ${formatCooldown(
          cooldown.remainingSeconds,
        )}.`,
      )
      return
    }

    const newEmail = values.newEmail.trim()
    const mfaCode = values.mfaCode.trim()

    if (
      newEmail.toLowerCase() ===
      currentEmail.toLowerCase()
    ) {
      form.setError('newEmail', {
        type: 'manual',
        message:
          'Enter an email address different from your current one',
      })
      return
    }

    if (
      mfaEnabled &&
      !/^\d{6}$/.test(mfaCode)
    ) {
      form.setError('mfaCode', {
        type: 'manual',
        message:
          'Enter the 6-digit code from your authenticator app',
      })
      return
    }

    try {
      await changeEmail.mutateAsync({
        newEmail,
        currentPassword:
          values.currentPassword,
        ...(mfaEnabled ? {mfaCode} : {}),
      })

      form.reset()
      cooldown.startCooldown()
      setRequestedEmail(newEmail)
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to request an email address change.',
      )
    }
  }

  return (
    <>
      <section className="flex h-full flex-col rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e7ecef] text-[#466775]">
            <Mail size={20} aria-hidden/>
          </span>

          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              EMAIL ADDRESS
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#173c32]">
              Where Salif reaches you
            </h2>
          </div>
        </div>

        <p className="mt-4 truncate text-sm font-semibold text-[#405d54]">
          {currentEmail}
        </p>

        <p className="mt-2 text-sm leading-6 text-[#657972]">
          A verification link will be sent to the new
          address before anything changes.
        </p>

        <div className="mt-auto pt-6">
          <button
            type="button"
            disabled={mfaStatus.isPending}
            onClick={openDialog}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#174f43] px-5 py-2.5 text-sm font-semibold text-[#174f43] transition hover:bg-[#174f43] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mfaStatus.isPending && (
              <LoaderCircle
                size={16}
                className="animate-spin"
                aria-hidden
              />
            )}

            {mfaStatus.isError
              ? 'Check again'
              : 'Change email'}
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-email-title"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102c25]/65 p-5 backdrop-blur-sm"
        >
          <div className="relative my-auto w-full max-w-lg rounded-3xl border border-white/20 bg-[#fffdf8] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              aria-label="Close change email dialog"
              disabled={changeEmail.isPending}
              onClick={closeDialog}
              className="absolute right-5 top-5 grid size-9 cursor-pointer place-items-center rounded-full text-[#657972] transition hover:bg-[#edf2ee] hover:text-[#173c32] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} aria-hidden/>
            </button>

            {requestedEmail ? (
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-[#e2eee7] text-[#276754]">
                  <CheckCircle2
                    size={23}
                    aria-hidden
                  />
                </span>

                <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-[#1F7A5C]">
                  CHECK YOUR INBOX
                </p>

                <h2
                  id="change-email-title"
                  className="mt-3 pr-10 font-serif text-3xl text-[#173c32]"
                >
                  Confirm your new address
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#657972]">
                  We sent a verification link to{' '}
                  <strong className="text-[#294e43]">
                    {requestedEmail}
                  </strong>
                  . Your current email remains active
                  until you open that link.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    disabled={
                      cooldown.isCoolingDown
                    }
                    onClick={() =>
                      setRequestedEmail(null)
                    }
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#174f43] px-6 py-3 text-sm font-semibold text-[#174f43] transition hover:bg-[#e8f2ed] disabled:cursor-not-allowed disabled:border-[#cbd8d1] disabled:bg-[#eef3f0] disabled:text-[#6e837a]"
                  >
                    {cooldown.isCoolingDown && (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                        aria-hidden
                      />
                    )}

                    {cooldown.isCoolingDown
                      ? `Request another change in ${formatCooldown(
                          cooldown.remainingSeconds,
                        )}`
                      : 'Request another email change'}
                  </button>

                  <button
                    type="button"
                    onClick={closeDialog}
                    className="w-full cursor-pointer rounded-full bg-[#174f43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#103d34]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="grid size-12 place-items-center rounded-2xl bg-[#e7ecef] text-[#466775]">
                  <Mail size={22} aria-hidden/>
                </span>

                <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-[#657972]">
                  ACCOUNT CONTACT
                </p>

                <h2
                  id="change-email-title"
                  className="mt-3 pr-10 font-serif text-3xl text-[#173c32]"
                >
                  Change your email address
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#657972]">
                  Verify the new address to complete the
                  change. Once confirmed, Salif will
                  close every active session.
                </p>

                <form
                  className="mt-6 space-y-5"
                  onSubmit={form.handleSubmit(
                    submitEmail,
                  )}
                  noValidate
                >
                  {cooldown.isCoolingDown && (
                    <p className="rounded-xl bg-[#edf3ed] px-4 py-3 text-sm text-[#526b63]">
                      Another request will be available
                      in{' '}
                      <strong>
                        {formatCooldown(
                          cooldown.remainingSeconds,
                        )}
                      </strong>
                      .
                    </p>
                  )}

                  <label className="block text-sm font-semibold text-[#294e43]">
                    New email address

                    <input
                      {...form.register('newEmail')}
                      type="email"
                      autoComplete="email"
                      disabled={
                        changeEmail.isPending
                      }
                      className={`mt-2 ${inputClassName}`}
                    />

                    {form.formState.errors
                      .newEmail && (
                      <span className="mt-2 block text-xs font-medium text-[#ad573e]">
                        {
                          form.formState.errors
                            .newEmail.message
                        }
                      </span>
                    )}
                  </label>

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
                        disabled={
                          changeEmail.isPending
                        }
                        className={`${inputClassName} pr-12`}
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

                  {mfaEnabled && (
                    <div className="rounded-2xl bg-[#edf3ed] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#294e43]">
                        <ShieldCheck
                          size={17}
                          aria-hidden
                        />
                        Authenticator confirmation
                      </div>

                      <label
                        htmlFor="changeEmailMfaCode"
                        className="mt-3 block text-center text-sm text-[#526b63]"
                      >
                        Enter your current six-digit code
                      </label>

                      <div className="mt-3">
                        <Controller
                          name="mfaCode"
                          control={form.control}
                          render={({field}) => (
                            <OtpCodeInput
                              id="changeEmailMfaCode"
                              name={field.name}
                              value={field.value}
                              disabled={
                                changeEmail.isPending
                              }
                              invalid={Boolean(
                                form.formState.errors
                                  .mfaCode,
                              )}
                              describedBy={
                                form.formState.errors
                                  .mfaCode
                                  ? 'change-email-mfa-error'
                                  : undefined
                              }
                              inputRef={field.ref}
                              onBlur={field.onBlur}
                              onChange={
                                field.onChange
                              }
                            />
                          )}
                        />
                      </div>

                      {form.formState.errors
                        .mfaCode && (
                        <p
                          id="change-email-mfa-error"
                          role="alert"
                          className="mt-2 text-center text-xs font-medium text-[#ad573e]"
                        >
                          {
                            form.formState.errors
                              .mfaCode.message
                          }
                        </p>
                      )}
                    </div>
                  )}

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
                    disabled={
                      changeEmail.isPending ||
                      cooldown.isCoolingDown
                    }
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#174f43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#103d34] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changeEmail.isPending && (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                        aria-hidden
                      />
                    )}

                    {changeEmail.isPending
                      ? 'Sending verification'
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