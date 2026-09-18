import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  ChevronDown,
  Copy,
  KeyRound,
  LifeBuoy,
  Mail,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'

import PublicPageLayout from '../components/layout/PublicPageLayout'

const configuredEmail: unknown = import.meta.env.VITE_SUPPORT_EMAIL

const supportEmail =
  typeof configuredEmail === 'string'
    ? configuredEmail.trim()
    : ''

const hasSupportEmail =
  /^[a-zA-Z0-9.!#$%&'*+/=_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(
    supportEmail,
  )

const topics = [
  {
    value: 'account-security',
    label: 'Account security or an unexpected email',
    subject: 'Salif support: account security',
  },
  {
    value: 'sign-in',
    label: 'Signing in or resetting my password',
    subject: 'Salif support: account access',
  },
  {
    value: 'verification',
    label: 'Verifying my email address',
    subject: 'Salif support: email verification',
  },
  {
    value: 'general',
    label: 'Something else',
    subject: 'Salif support: general enquiry',
  },
] as const

type SupportTopic = (typeof topics)[number]['value']

interface SupportFormValues {
  name: string
  email: string
  topic: SupportTopic
  message: string
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
  'focus:ring-2 focus:ring-[#e0ad51]'

const MAX_MESSAGE_LENGTH = 1500

export default function SupportPage() {
  const [values, setValues] = useState<SupportFormValues>({
    name: '',
    email: '',
    topic: 'account-security',
    message: '',
  })

  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackIsError, setFeedbackIsError] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  const selectedTopic =
    topics.find((item) => item.value === values.topic) ?? topics[0]

  function updateField<K extends keyof SupportFormValues>(
    field: K,
    value: SupportFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
    setFeedback(null)
    setFeedbackIsError(false)
  }

  function prepareDraft() {
    return [
      'Hello Salif support,',
      '',
      `Name: ${values.name.trim()}`,
      `Contact email: ${values.email.trim()}`,
      `Topic: ${selectedTopic.label}`,
      '',
      values.message.trim(),
    ].join('\r\n')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasSupportEmail || isCopying) {
      return
    }

    setFeedback(null)
    setFeedbackIsError(false)

    if (!values.name.trim() || !values.message.trim()) {
      setFeedback('Please enter your name and describe what you need help with.')
      setFeedbackIsError(true)
      return
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const shouldCopy =
      submitter instanceof HTMLButtonElement &&
      submitter.value === 'copy'

    const draft = prepareDraft()

    if (shouldCopy) {
      setIsCopying(true)

      try {
        await navigator.clipboard.writeText(
          `To: ${supportEmail}\r\nSubject: ${selectedTopic.subject}\r\n\r\n${draft}`,
        )

        setFeedback(
          'Draft copied. Paste it into your email app, review it and send it to the support address below.',
        )
      } catch {
        setFeedback(
          'Your browser could not copy the draft. You can select and copy your message manually, or use “Open email draft”.',
        )
        setFeedbackIsError(true)
      } finally {
        setIsCopying(false)
      }

      return
    }

    const emailHref =
      `mailto:${encodeURIComponent(supportEmail)}` +
      `?subject=${encodeURIComponent(selectedTopic.subject)}` +
      `&body=${encodeURIComponent(draft)}`

    try {
      window.location.assign(emailHref)

      setFeedback(
        'Your draft is ready. Finish sending it in your email app. If nothing opened, use “Copy draft” and send it through webmail.',
      )
    } catch {
      setFeedback(
        'We could not open your email app. Use “Copy draft” and send it through webmail instead.',
      )
      setFeedbackIsError(true)
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

            <p className="mt-3 text-sm leading-7 text-[#c5ddd4]">
              Tell us what happened. We’ll prepare an email draft for you
              to review and send from your email app.
            </p>

            {hasSupportEmail ? (
              <form
                onSubmit={(event) => void handleSubmit(event)}
                className="mt-6 space-y-5"
              >
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
                      maxLength={100}
                      value={values.name}
                      onChange={(event) =>
                        updateField('name', event.target.value)
                      }
                      placeholder="Your name"
                      className={fieldClasses}
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
                      placeholder="you@example.com"
                      className={fieldClasses}
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
                    className={`${fieldClasses} cursor-pointer pr-10`}
                  >
                    {topics.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
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
                    maxLength={MAX_MESSAGE_LENGTH}
                    value={values.message}
                    onChange={(event) =>
                      updateField('message', event.target.value)
                    }
                    aria-describedby="support-message-help support-message-count"
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

                {feedback && (
                  <p
                    role={feedbackIsError ? 'alert' : 'status'}
                    className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                      feedbackIsError
                        ? 'bg-[#fff0e7] text-[#873d28]'
                        : 'bg-[#e4efe6] text-[#24533c]'
                    }`}
                  >
                    {feedback}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="submit"
                    name="action"
                    value="email"
                    disabled={isCopying}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#e0ad51] px-5 py-3.5 text-sm font-bold text-[#143d30] transition hover:bg-[#edbf69] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Open email draft
                    <ArrowRight size={17} aria-hidden />
                  </button>

                  <button
                    type="submit"
                    name="action"
                    value="copy"
                    disabled={isCopying}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Copy size={15} aria-hidden />
                    {isCopying ? 'Copying…' : 'Copy draft'}
                  </button>
                </div>

                <p className="text-xs leading-6 text-[#c5ddd4]">
                  This form does not send a message directly. Finish
                  sending your draft in your email app, or copy it into
                  webmail.
                </p>
              </form>
            ) : (
              <div className="mt-6 border-t border-white/20 pt-5">
                <p className="text-sm font-semibold text-[#f0cf8d]">
                  Email support is currently unavailable.
                </p>

                <p className="mt-2 text-sm leading-6 text-[#c5ddd4]">
                  You can still use the account recovery and security
                  options above.
                </p>
              </div>
            )}

            {hasSupportEmail && (
              <div className="mt-6 border-t border-white/15 pt-5">
                <p className="text-xs text-[#c5ddd4]">
                  You can also email us directly:
                </p>

                <a
                  href={`mailto:${encodeURIComponent(supportEmail)}`}
                  className="mt-2 inline-block break-all rounded-sm text-sm font-semibold text-white underline decoration-[#e0ad51] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {supportEmail}
                </a>
              </div>
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