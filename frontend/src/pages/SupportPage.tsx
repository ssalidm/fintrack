import { useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  LifeBuoy,
  LoaderCircle,
  Mail,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'

import { ApiClientError } from '../api/ApiClientError'
import PublicPageLayout from '../components/layout/PublicPageLayout'
import {
  supportApi,
  supportTopics,
} from '../features/support/api/supportApi'
import type { SupportTopic } from '../features/support/api/supportApi'
import SupportVerification from '../features/support/components/SupportVerification'

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
    title: 'Reset your password',
    description:
      'Request a new reset email if you cannot remember your password.',
    to: '/forgot-password',
    Icon: KeyRound,
  },
  {
    title: 'Verify your email',
    description:
      'Request another verification email to finish setting up your account.',
    to: '/resend-verification',
    Icon: MailCheck,
  },
  {
    title: 'Review account security',
    description:
      'Sign in to review your sessions, password and two-factor authentication.',
    to: '/profile',
    Icon: ShieldCheck,
  },
]

const questions = [
  {
    question: 'I received a password reset email I did not request.',
    answer:
      'Receiving a reset email does not by itself mean your password was changed. If you did not request it, do not use or share its reset link. You can ignore the email. If you notice unfamiliar activity or receive repeated unexpected emails, review your account security and contact support.',
  },
  {
    question: 'My password reset link has expired or already been used.',
    answer:
      'Request a new email from the password reset page and use the link in the latest message. If you requested several emails, avoid using an older link.',
  },
  {
    question: 'I have not received the email I requested.',
    answer:
      'Check your spam or junk folder and confirm that you entered the address associated with your account. Allow a little time for delivery before requesting another email. For privacy, the request confirmation does not tell you whether an account exists.',
  },
  {
    question: 'What information should I include when contacting support?',
    answer:
      'Describe what you were trying to do, what happened instead, the approximate time, and any error message you saw. Include your browser and device if relevant. Never send passwords, reset links, verification codes, recovery codes or bank details. Remove private information from screenshots.',
  },
]

const focusClasses =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16805f]'

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-[#bfd2c8] ' +
  'bg-[#fffdf8] px-4 py-3 text-sm text-[#123e33] outline-none ' +
  'transition placeholder:text-[#819188] focus:border-[#e0ad51] ' +
  'focus:ring-2 focus:ring-[#e0ad51] ' +
  'disabled:cursor-not-allowed disabled:opacity-70'

function FieldError({
  id,
  message,
}: {
  id: string
  message?: string
}) {
  if (!message) return null

  return (
    <p id={id} role="alert" className="mt-2 text-xs text-[#ffd8bd]">
      {message}
    </p>
  )
}

export default function SupportPage() {
  const [values, setValues] =
    useState<SupportFormValues>({ ...initialValues })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [verificationKey, setVerificationKey] = useState(0)

  const submittingRef = useRef(false)

  function updateField<K extends keyof SupportFormValues>(
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submittingRef.current || isSubmitted) return

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      topic: values.topic,
      message: values.message.trim(),
      website: values.website,
      turnstileToken,
    }

    const errors: FieldErrors = {}

    if (payload.name.length < 2 || payload.name.length > 100) {
      errors.name = 'Enter a name between 2 and 100 characters.'
    }

    if (
      !payload.email ||
      payload.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
    ) {
      errors.email = 'Enter a valid email address.'
    }

    if (
      payload.message.length < 10 ||
      payload.message.length > MAX_MESSAGE_LENGTH
    ) {
      errors.message = 'Enter a message between 10 and 4,000 characters.'
    }

    setFieldErrors(errors)
    setSubmitError(null)

    if (Object.keys(errors).length > 0) return

    if (!siteKey || !turnstileToken) {
      setSubmitError('Please complete the security check before sending.')
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)

    try {
      await supportApi.contact(payload)

      setValues({ ...initialValues })
      setFieldErrors({})
      setIsSubmitted(true)
    } catch (error) {
      if (error instanceof ApiClientError) {
        const validation = error.validationErrors

        if (validation) {
          setFieldErrors({
            name: validation.name,
            email: validation.email,
            topic: validation.topic,
            message: validation.message,
          })

          setSubmitError(
            validation.turnstileToken
              ? 'Please complete the security check again.'
              : 'Please review the form and try again.',
          )
        } else if (error.status === 429) {
          setSubmitError(
            'Too many support requests. Please wait before trying again. Your message is still here.',
          )
        } else if (error.isNetworkError) {
          setSubmitError(
            'We could not confirm your submission. Check your connection before trying again. Your message is still here.',
          )
        } else if (error.status >= 500) {
          setSubmitError(
            'Support is temporarily unavailable. Please try again shortly. Your message is still here.',
          )
        } else {
          setSubmitError(
            error.message || 'Your request could not be completed.',
          )
        }
      } else {
        setSubmitError(
          'Your request could not be completed. Please try again.',
        )
      }
    } finally {
      // Verification tokens must not be reused for another attempt.
      setTurnstileToken('')
      setVerificationKey((current) => current + 1)
      setIsSubmitting(false)
      submittingRef.current = false
    }
  }

  return (
    <PublicPageLayout>
      <header className="mx-auto max-w-[720px] text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-[#16805f]">
          <LifeBuoy size={16} aria-hidden />
          Salif support
        </span>

        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#103b30] sm:text-5xl lg:text-6xl">
          A little help goes a long way.
        </h1>

        <p className="mx-auto mt-5 max-w-[600px] text-base leading-7 text-[#536d63]">
          Find your way back into your account, get answers, or contact
          support. You do not need to sign in to get in touch.
        </p>

        <span
          aria-hidden
          className="mx-auto mt-7 block h-1 w-12 rounded-full bg-[#d7a84d]"
        />
      </header>

      <section
        aria-label="Account help shortcuts"
        className="mt-10 grid border-y border-[#d9d4c8] md:grid-cols-3"
      >
        {helpLinks.map(({ title, description, to, Icon }, index) => (
          <Link
            key={to}
            to={to}
            className={`group flex items-start gap-3 py-6 transition hover:bg-[#e6eee5]/60 ${
              index > 0
                ? 'border-t border-[#d9d4c8] md:border-l md:border-t-0 md:pl-5 lg:pl-7'
                : ''
            } ${
              index < helpLinks.length - 1
                ? 'md:pr-5 lg:pr-7'
                : ''
            } ${focusClasses}`}
          >
            <Icon
              size={21}
              className="mt-0.5 shrink-0 text-[#16805f]"
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-[#103b30]">
                {title}
              </h2>

              <p className="mt-2 text-xs leading-6 text-[#657972]">
                {description}
              </p>
            </div>

            <ArrowRight
              size={15}
              className="mt-1 shrink-0 text-[#956624] transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        ))}
      </section>

      <div className="mt-9 grid items-start gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <section
          aria-labelledby="contact-title"
          className="relative overflow-hidden rounded-[1.75rem] bg-[#0d4f3f] p-6 text-white shadow-[0_18px_45px_rgba(13,79,63,0.12)] sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full border border-white/10"
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <Mail size={24} className="text-[#e4bd70]" aria-hidden />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a9d0c1]">
                Get in touch
              </p>
            </div>

            <h2
              id="contact-title"
              className="mt-4 font-serif text-3xl tracking-[-0.025em] sm:text-4xl"
            >
              How can we help?
            </h2>

            {isSubmitted ? (
              <div className="mt-7">
                <div role="status">
                  <CheckCircle2
                    size={34}
                    className="text-[#e4bd70]"
                    aria-hidden
                  />

                  <h3 className="mt-4 font-serif text-2xl">
                    Your request has been submitted.
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#c5ddd4]">
                    Thank you for getting in touch. Any reply will go to
                    the email address you provided.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitError(null)
                    setIsSubmitted(false)
                  }}
                  className="mt-6 cursor-pointer rounded-full border border-white/30 px-5 py-3 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm leading-7 text-[#c5ddd4]">
                  Tell us what happened and send your message directly
                  to the Salif support team.
                </p>

                <form
                  onSubmit={(event) => void handleSubmit(event)}
                  className="mt-6"
                  aria-busy={isSubmitting}
                >
                  <fieldset
                    disabled={isSubmitting}
                    className="min-w-0 space-y-5"
                  >
                    <legend className="sr-only">
                      Contact support
                    </legend>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="support-name"
                          className="text-sm font-semibold text-[#edf5f0]"
                        >
                          Your name
                        </label>

                        <input
                          id="support-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={100}
                          value={values.name}
                          onChange={(event) =>
                            updateField('name', event.target.value)
                          }
                          aria-invalid={Boolean(fieldErrors.name)}
                          aria-describedby={
                            fieldErrors.name ? 'support-name-error' : undefined
                          }
                          placeholder="Your name"
                          className={fieldClasses}
                        />

                        <FieldError
                          id="support-name-error"
                          message={fieldErrors.name}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="support-email"
                          className="text-sm font-semibold text-[#edf5f0]"
                        >
                          Email address
                        </label>

                        <input
                          id="support-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          value={values.email}
                          onChange={(event) =>
                            updateField('email', event.target.value)
                          }
                          aria-invalid={Boolean(fieldErrors.email)}
                          aria-describedby={
                            fieldErrors.email ? 'support-email-error' : undefined
                          }
                          placeholder="you@example.com"
                          className={fieldClasses}
                        />

                        <FieldError
                          id="support-email-error"
                          message={fieldErrors.email}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="support-topic"
                        className="text-sm font-semibold text-[#edf5f0]"
                      >
                        What is this about?
                      </label>

                      <select
                        id="support-topic"
                        name="topic"
                        value={values.topic}
                        onChange={(event) =>
                          updateField(
                            'topic',
                            event.target.value as SupportTopic,
                          )
                        }
                        aria-invalid={Boolean(fieldErrors.topic)}
                        aria-describedby={
                          fieldErrors.topic ? 'support-topic-error' : undefined
                        }
                        className={`${fieldClasses} cursor-pointer pr-10`}
                      >
                        {supportTopics.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      <FieldError
                        id="support-topic-error"
                        message={fieldErrors.topic}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="support-message"
                        className="text-sm font-semibold text-[#edf5f0]"
                      >
                        Your message
                      </label>

                      <textarea
                        id="support-message"
                        name="message"
                        required
                        rows={6}
                        minLength={10}
                        maxLength={MAX_MESSAGE_LENGTH}
                        value={values.message}
                        onChange={(event) =>
                          updateField('message', event.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.message)}
                        aria-describedby={`support-message-help support-message-count${
                          fieldErrors.message ? ' support-message-error' : ''
                        }`}
                        placeholder="What were you trying to do, and what happened instead?"
                        className={`${fieldClasses} resize-y`}
                      />

                      <div className="mt-2 flex items-start justify-between gap-4 text-xs leading-5 text-[#c5ddd4]">
                        <p id="support-message-help">
                          Include the approximate time and any error message.
                        </p>

                        <span
                          id="support-message-count"
                          className="shrink-0 tabular-nums"
                        >
                          {values.message.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                      </div>

                      <FieldError
                        id="support-message-error"
                        message={fieldErrors.message}
                      />
                    </div>

                    <div
                      aria-hidden="true"
                      className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden"
                    >
                      <label htmlFor="support-website">
                        Leave this field empty
                      </label>
                      <input
                        id="support-website"
                        name="website"
                        type="text"
                        autoComplete="off"
                        tabIndex={-1}
                        maxLength={200}
                        value={values.website}
                        onChange={(event) =>
                          updateField('website', event.target.value)
                        }
                      />
                    </div>

                    <div className="flex items-start gap-2.5 border-t border-white/15 pt-4">
                      <ShieldCheck
                        size={16}
                        className="mt-1 shrink-0 text-[#e4bd70]"
                        aria-hidden
                      />

                      <p className="text-xs leading-6 text-[#c5ddd4]">
                        Do not include passwords, reset links, verification
                        codes, recovery codes or bank details.
                      </p>
                    </div>

                    {siteKey ? (
                      <SupportVerification
                        key={verificationKey}
                        siteKey={siteKey}
                        onTokenChange={setTurnstileToken}
                      />
                    ) : (
                      <p
                        role="alert"
                        className="rounded-xl bg-[#fff0e7] px-4 py-3 text-sm leading-6 text-[#873d28]"
                      >
                        The contact form is temporarily unavailable.
                        Please try again later.
                      </p>
                    )}

                    {submitError && (
                      <p
                        role="alert"
                        className="rounded-xl bg-[#fff0e7] px-4 py-3 text-sm leading-6 text-[#873d28]"
                      >
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !siteKey || !turnstileToken}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#e0ad51] px-5 py-3.5 text-sm font-bold text-[#143d30] transition hover:bg-[#edbf69] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
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
                          <ArrowRight size={17} aria-hidden />
                        </>
                      )}
                    </button>
                  </fieldset>
                </form>
              </>
            )}
          </div>
        </section>

        <section aria-labelledby="questions-title" className="lg:pt-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16805f]">
            Useful answers
          </p>

          <h2
            id="questions-title"
            className="mt-2 font-serif text-3xl tracking-[-0.025em] text-[#103b30]"
          >
            Before you write
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#657972]">
            A few answers to help you take the next step.
          </p>

          <div className="mt-5 divide-y divide-[#d9d4c8] border-y border-[#d9d4c8]">
            {questions.map((item, index) => (
              <details
                key={item.question}
                className="group py-5"
                open={index === 0}
              >
                <summary
                  className={`flex cursor-pointer list-none items-start justify-between gap-4 rounded-sm text-sm font-semibold leading-6 text-[#123e33] [&::-webkit-details-marker]:hidden ${focusClasses}`}
                >
                  {item.question}
                  <ChevronDown
                    size={17}
                    className="mt-1 shrink-0 text-[#16805f] transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>

                <p className="mt-3 pr-5 text-sm leading-7 text-[#657972]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </PublicPageLayout>
  )
}