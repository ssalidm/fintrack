import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  LifeBuoy,
  LoaderCircle,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'
import {
  useRef,
  useState,
} from 'react'
import type { SubmitEvent } from 'react'
import { Link } from 'react-router'

import { ApiClientError } from '@/api/ApiClientError'
import {
  supportApi,
  supportTopics,
} from '@/features/support/api/supportApi'
import type { SupportTopic } from '@/features/support/api/supportApi'
import SupportVerification from '@/features/support/components/SupportVerification'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'


const siteKey =
  import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''

const MAX_MESSAGE_LENGTH = 2000

interface SupportFormValues {
  name: string
  email: string
  topic: SupportTopic
  message: string
  website: string
}

type FieldErrors = Partial<
  Record<keyof SupportFormValues, string>
>

const initialValues: SupportFormValues = {
  name: '',
  email: '',
  topic: 'SECURITY',
  message: '',
  website: '',
}

const helpLinks = [
  {
    title: 'Reset password',
    description:
      'Request a new password reset email.',
    to: '/forgot-password',
    Icon: KeyRound,
  },
  {
    title: 'Verify email',
    description:
      'Send another verification email.',
    to: '/resend-verification',
    Icon: MailCheck,
  },
  {
    title: 'Account security',
    description:
      'Review sessions, password and 2FA.',
    to: '/profile',
    Icon: ShieldCheck,
  },
]

const questions = [
  {
    question:
      'I received a reset email I did not request.',
    answer:
      'Receiving the email does not mean your password was changed. Do not use or share the reset link. If you notice unfamiliar account activity, review your account security and contact support.',
  },
  {
    question:
      'My reset link has expired.',
    answer:
      'Request a new password reset email and use the link from the most recent message.',
  },
  {
    question:
      'I have not received an email.',
    answer:
      'Check your spam or junk folder and confirm that you entered the email address associated with your account.',
  },
  {
    question:
      'What should I include in my message?',
    answer:
      'Tell us what you were trying to do, what happened instead, and any error message you saw. Never include passwords, recovery codes or bank details.',
  },
]

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-line bg-app px-4 py-3 ' +
  'text-sm text-ink outline-none transition placeholder:text-subtle ' +
  'focus:border-accent focus:ring-4 focus:ring-accent/10 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

function FieldError({
  id,
  message,
}: {
  id: string
  message?: string
}) {
  if (!message) return null

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 text-xs font-medium text-danger"
    >
      {message}
    </p>
  )
}

export default function SupportPage() {
  const [
    values,
    setValues,
  ] = useState<SupportFormValues>({
    ...initialValues,
  })

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<FieldErrors>({})

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    isSubmitted,
    setIsSubmitted,
  ] = useState(false)

  const [
    turnstileToken,
    setTurnstileToken,
  ] = useState('')

  const [
    verificationKey,
    setVerificationKey,
  ] = useState(0)


  const submittingRef =
    useRef(false)

  function updateField<
    K extends keyof SupportFormValues,
  >(
    field: K,
    value: SupportFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }))

    setSubmitError(null)
  }

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      submittingRef.current ||
      isSubmitted
    ) {
      return
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      topic: values.topic,
      message: values.message.trim(),
      website: values.website,
      turnstileToken,
    }

    const errors: FieldErrors = {}

    if (
      payload.name.length < 2 ||
      payload.name.length > 100
    ) {
      errors.name =
        'Enter a name between 2 and 100 characters.'
    }

    if (
      !payload.email ||
      payload.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        payload.email,
      )
    ) {
      errors.email =
        'Enter a valid email address.'
    }

    if (
      payload.message.length < 10 ||
      payload.message.length >
      MAX_MESSAGE_LENGTH
    ) {
      errors.message =
        'Enter a message between 10 and 2,000 characters.'
    }

    setFieldErrors(errors)
    setSubmitError(null)

    if (
      Object.keys(errors).length > 0
    ) {
      return
    }

    if (
      !siteKey ||
      !turnstileToken
    ) {
      setSubmitError(
        'Please complete the security check before sending.',
      )
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)

    try {
      await supportApi.contact(
        payload,
      )

      setValues({
        ...initialValues,
      })

      setFieldErrors({})
      setIsSubmitted(true)
    } catch (error) {
      if (
        error instanceof ApiClientError
      ) {
        const validation =
          error.validationErrors

        if (validation) {
          setFieldErrors({
            name: validation.name,
            email: validation.email,
            topic: validation.topic,
            message:
              validation.message,
          })

          setSubmitError(
            validation.turnstileToken
              ? 'Please complete the security check again.'
              : 'Please review the form and try again.',
          )
        } else if (
          error.status === 429
        ) {
          setSubmitError(
            'Too many support requests. Please wait before trying again.',
          )
        } else if (
          error.isNetworkError
        ) {
          setSubmitError(
            'We could not confirm your submission. Check your connection and try again.',
          )
        } else if (
          error.status >= 500
        ) {
          setSubmitError(
            'Support is temporarily unavailable. Please try again shortly.',
          )
        } else {
          setSubmitError(
            error.message ||
            'Your request could not be completed.',
          )
        }
      } else {
        setSubmitError(
          'Your request could not be completed. Please try again.',
        )
      }
    } finally {
      setTurnstileToken('')

      setVerificationKey(
        (current) =>
          current + 1,
      )

      setIsSubmitting(false)

      submittingRef.current =
        false
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-app text-ink">
      {/* Shared navbar + hero atmosphere */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] overflow-hidden"
        aria-hidden
      >
        {/* soft brand washes */}
        <div className="absolute -left-36 -top-32 size-[28rem] rounded-full bg-accent-soft/70 blur-[110px]" />

        <div className="absolute -right-40 -top-20 size-[25rem] rounded-full bg-warning-soft/45 blur-[110px]" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(to_right,var(--salif-color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--salif-color-border)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.65)_58%,transparent_100%)]" />

        {/* larger architectural lines */}
        <div className="absolute left-[8%] top-20 h-[320px] w-[320px] rounded-full border border-line/50" />
        <div className="absolute left-[8%] top-20 h-[240px] w-[240px] translate-x-10 translate-y-10 rounded-full border border-line/35" />

        <div className="absolute right-[10%] top-28 h-px w-40 rotate-[-12deg] bg-line" />
        <div className="absolute right-[8%] top-40 h-px w-24 rotate-[-12deg] bg-line/70" />
      </div>

      <a
        href="#main-content"
        className="sr-only z-[70] rounded-lg bg-surface px-4 py-3 text-sm font-semibold text-ink focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Skip to content
      </a>

      {/* Navbar */}
      <PublicNavbar />


      <main
        id="main-content"
        tabIndex={-1}
      >
        {/* Hero */}

        <section className="relative z-10">
          <div className="mx-auto max-w-[1240px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-18 lg:px-12 lg:pb-24">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-[690px]">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
                  <LifeBuoy
                    size={15}
                    aria-hidden
                  />

                  Salif support
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.6rem]">
                  How can we Help
                  <span className="blocks text-accent">
                    ?
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-muted">
                  Start with a quick account fix or send us a message.
                </p>
              </div>

              <div className="hidden pb-1 lg:block">
                <div className="flex items-center gap-3 rounded-full border border-line bg-surface/55 px-4 py-2.5 text-sm text-muted backdrop-blur-sm">
                  <span className="size-2 rounded-full bg-success" />

                  Support is available without signing in
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}

        <section className="border-y border-line bg-surface">
          <div
            aria-label="Account help shortcuts"
            className="mx-auto grid max-w-[1240px] px-5 sm:px-8 md:grid-cols-3 lg:px-12"
          >
            {helpLinks.map(
              (
                {
                  title,
                  description,
                  to,
                  Icon,
                },
                index,
              ) => (
                <Link
                  key={to}
                  to={to}
                  className={`group flex items-center gap-4 py-6 transition hover:bg-surface-muted/60 md:px-6 ${index === 0
                    ? 'md:pl-0'
                    : 'border-t border-line md:border-l md:border-t-0'
                    }`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon
                      size={18}
                      aria-hidden
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted">
                      {description}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="shrink-0 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent"
                    aria-hidden
                  />
                </Link>
              ),
            )}
          </div>
        </section>

        {/* Contact + FAQ */}

        <section className="bg-surface">
          <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-20">
            {/* Contact */}

            <section
              aria-labelledby="contact-title"
              className="max-w-[680px]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Contact us
              </p>

              <h2
                id="contact-title"
                className="mt-3 text-3xl font-bold tracking-[-0.035em] text-ink"
              >
                Send a message
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted">
                You do not need to sign
                in.
              </p>

              {isSubmitted ? (
                <div
                  role="status"
                  className="mt-8 border-t border-line pt-8"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
                    <CheckCircle2
                      size={24}
                      aria-hidden
                    />
                  </span>

                  <h3 className="mt-5 text-xl font-semibold text-ink">
                    Message sent
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                    We received your
                    request. Any reply will
                    go to the email address
                    you provided.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null)
                      setIsSubmitted(
                        false,
                      )
                    }}
                    className="mt-6 rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(event) =>
                    void handleSubmit(
                      event,
                    )
                  }
                  className="mt-8"
                  aria-busy={
                    isSubmitting
                  }
                >
                  <fieldset
                    disabled={
                      isSubmitting
                    }
                    className="min-w-0 space-y-5"
                  >
                    <legend className="sr-only">
                      Contact support
                    </legend>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="support-name"
                          className="text-sm font-semibold text-ink"
                        >
                          Name
                        </label>

                        <input
                          id="support-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={100}
                          value={
                            values.name
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              'name',
                              event.target
                                .value,
                            )
                          }
                          aria-invalid={Boolean(
                            fieldErrors.name,
                          )}
                          aria-describedby={
                            fieldErrors.name
                              ? 'support-name-error'
                              : undefined
                          }
                          placeholder="Your name"
                          className={
                            fieldClasses
                          }
                        />

                        <FieldError
                          id="support-name-error"
                          message={
                            fieldErrors.name
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="support-email"
                          className="text-sm font-semibold text-ink"
                        >
                          Email
                        </label>

                        <input
                          id="support-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          value={
                            values.email
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              'email',
                              event.target
                                .value,
                            )
                          }
                          aria-invalid={Boolean(
                            fieldErrors.email,
                          )}
                          aria-describedby={
                            fieldErrors.email
                              ? 'support-email-error'
                              : undefined
                          }
                          placeholder="you@example.com"
                          className={
                            fieldClasses
                          }
                        />

                        <FieldError
                          id="support-email-error"
                          message={
                            fieldErrors.email
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="support-topic"
                        className="text-sm font-semibold text-ink"
                      >
                        Topic
                      </label>

                      <select
                        id="support-topic"
                        name="topic"
                        value={
                          values.topic
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'topic',
                            event.target
                              .value as SupportTopic,
                          )
                        }
                        aria-invalid={Boolean(
                          fieldErrors.topic,
                        )}
                        aria-describedby={
                          fieldErrors.topic
                            ? 'support-topic-error'
                            : undefined
                        }
                        className={`${fieldClasses} cursor-pointer`}
                      >
                        {supportTopics.map(
                          (item) => (
                            <option
                              key={
                                item.value
                              }
                              value={
                                item.value
                              }
                            >
                              {
                                item.label
                              }
                            </option>
                          ),
                        )}
                      </select>

                      <FieldError
                        id="support-topic-error"
                        message={
                          fieldErrors.topic
                        }
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <label
                          htmlFor="support-message"
                          className="text-sm font-semibold text-ink"
                        >
                          Message
                        </label>

                        <span className="text-xs tabular-nums text-subtle">
                          {
                            values.message
                              .length
                          }
                          /
                          {
                            MAX_MESSAGE_LENGTH
                          }
                        </span>
                      </div>

                      <textarea
                        id="support-message"
                        name="message"
                        required
                        rows={6}
                        minLength={10}
                        maxLength={
                          MAX_MESSAGE_LENGTH
                        }
                        value={
                          values.message
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'message',
                            event.target
                              .value,
                          )
                        }
                        aria-invalid={Boolean(
                          fieldErrors.message,
                        )}
                        aria-describedby={
                          fieldErrors.message
                            ? 'support-message-error'
                            : undefined
                        }
                        placeholder="Tell us what happened..."
                        className={`${fieldClasses} resize-y`}
                      />

                      <FieldError
                        id="support-message-error"
                        message={
                          fieldErrors.message
                        }
                      />
                    </div>

                    <div
                      aria-hidden="true"
                      className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden"
                    >
                      <label htmlFor="support-website">
                        Leave this field
                        empty
                      </label>

                      <input
                        id="support-website"
                        name="website"
                        type="text"
                        autoComplete="off"
                        tabIndex={-1}
                        maxLength={200}
                        value={
                          values.website
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'website',
                            event.target
                              .value,
                          )
                        }
                      />
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-warning-soft px-4 py-3">
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-warning"
                        aria-hidden
                      />

                      <p className="text-xs leading-5 text-ink">
                        Never send
                        passwords, recovery
                        codes or bank
                        details.
                      </p>
                    </div>

                    {siteKey ? (
                      <SupportVerification
                        key={
                          verificationKey
                        }
                        siteKey={
                          siteKey
                        }
                        onTokenChange={
                          setTurnstileToken
                        }
                      />
                    ) : (
                      <p
                        role="alert"
                        className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
                      >
                        The contact form is
                        temporarily
                        unavailable.
                      </p>
                    )}

                    {submitError && (
                      <p
                        role="alert"
                        className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
                      >
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !siteKey ||
                        !turnstileToken
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                            aria-hidden
                          />

                          Sending…
                        </>
                      ) : (
                        <>
                          Send message

                          <ArrowRight
                            size={16}
                            aria-hidden
                          />
                        </>
                      )}
                    </button>
                  </fieldset>
                </form>
              )}
            </section>

            {/* FAQ */}

            <aside className="lg:border-l lg:border-line lg:pl-12">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Common questions
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-ink">
                You may not need to wait
              </h2>

              <div className="mt-7 divide-y divide-line border-y border-line">
                {questions.map(
                  (
                    item,
                    index,
                  ) => (
                    <details
                      key={
                        item.question
                      }
                      open={
                        index === 0
                      }
                      className="group py-5"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold leading-6 text-ink [&::-webkit-details-marker]:hidden">
                        {
                          item.question
                        }

                        <ChevronDown
                          size={17}
                          className="mt-1 shrink-0 text-accent transition-transform group-open:rotate-180"
                          aria-hidden
                        />
                      </summary>

                      <p className="mt-3 pr-6 text-sm leading-6 text-muted">
                        {item.answer}
                      </p>
                    </details>
                  ),
                )}
              </div>

              <div className="mt-9">
                <p className="text-sm font-semibold text-ink">
                  Still stuck?
                </p>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Send us the details and
                  we’ll take a look.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      {/* Footer */}

      <PublicFooter />
    </div>
  )
}