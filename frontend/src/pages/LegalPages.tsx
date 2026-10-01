import {
  ArrowUpRight,
  FileText,
  ShieldCheck,
} from 'lucide-react'

import { Link } from 'react-router'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'

interface LegalSection {
  title: string
  paragraphs: string[]
}

interface LegalDocumentProps {
  eyebrow: string
  title: string
  introduction: string
  type: 'privacy' | 'terms'
  sections: LegalSection[]
}

function sectionId(
  index: number,
) {
  return `section-${index + 1}`
}

function LegalDocument({
  eyebrow,
  title,
  introduction,
  type,
  sections,
}: LegalDocumentProps) {
  const HeaderIcon =
    type === 'privacy'
      ? ShieldCheck
      : FileText

  return (
    <div className="relative min-h-screen overflow-x-clip bg-app text-ink">
      <a
        href="#main-content"
        className="sr-only z-[70] rounded-lg bg-surface px-4 py-3 text-sm font-semibold text-ink focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Skip to content
      </a>

      {/* Shared navbar + hero atmosphere */}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[570px] overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-36 -top-32 size-[28rem] rounded-full bg-accent-soft/70 blur-[110px]" />

        <div className="absolute -right-40 -top-20 size-[25rem] rounded-full bg-warning-soft/45 blur-[110px]" />

        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(to_right,var(--salif-color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--salif-color-border)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.65)_58%,transparent_100%)]" />

        <div className="absolute left-[8%] top-20 size-[320px] rounded-full border border-line/50" />

        <div className="absolute left-[8%] top-20 size-[240px] translate-x-10 translate-y-10 rounded-full border border-line/35" />

        <div className="absolute right-[10%] top-28 h-px w-40 rotate-[-12deg] bg-line" />

        <div className="absolute right-[8%] top-40 h-px w-24 rotate-[-12deg] bg-line/70" />
      </div>

      {/* Navbar */}
      <PublicNavbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10"
      >
        {/* Hero */}

        <section>
          <div className="mx-auto max-w-[1240px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-18 lg:px-12 lg:pb-24">
            <div className="max-w-[760px]">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
                <HeaderIcon
                  size={15}
                  aria-hidden
                />

                {eyebrow}
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.7rem]">
                {title}
              </h1>

              <p className="mt-5 max-w-[650px] text-base leading-7 text-muted sm:text-lg">
                {introduction}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-subtle">
                <span>
                  Last updated
                </span>

                <time
                  dateTime="2026-09-11"
                  className="font-semibold text-muted"
                >
                  11 September 2026
                </time>
              </div>
            </div>
          </div>
        </section>

        {/* Document */}

        <section className="border-t border-line bg-surface">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-20">
            {/* On this page */}

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">
                  On this page
                </p>

                <nav
                  aria-label={`${title} sections`}
                  className="mt-5 border-l border-line"
                >
                  {sections.map(
                    (
                      section,
                      index,
                    ) => (
                      <a
                        key={
                          section.title
                        }
                        href={`#${sectionId(
                          index,
                        )}`}
                        className="group flex gap-3 border-l-2 border-transparent py-2.5 pl-4 text-sm text-muted transition hover:border-accent hover:text-ink"
                      >
                        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-subtle">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            '0',
                          )}
                        </span>

                        <span>
                          {
                            section.title
                          }
                        </span>
                      </a>
                    ),
                  )}
                </nav>

                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-xs leading-5 text-muted">
                    Questions about your
                    account?
                  </p>

                  <Link
                    to="/support"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-primary"
                  >
                    Contact support

                    <ArrowUpRight
                      size={15}
                      aria-hidden
                    />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Legal content */}

            <article
              aria-label={title}
              className="min-w-0"
            >
              <div className="max-w-[760px]">
                {sections.map(
                  (
                    section,
                    index,
                  ) => (
                    <section
                      key={
                        section.title
                      }
                      id={sectionId(
                        index,
                      )}
                      aria-labelledby={`legal-heading-${index + 1
                        }`}
                      className={`scroll-mt-28 ${index > 0
                          ? 'mt-10 border-t border-line pt-10 sm:mt-12 sm:pt-12'
                          : ''
                        }`}
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <span
                          aria-hidden
                          className="mt-1 shrink-0 text-xs font-bold tabular-nums text-accent"
                        >
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            '0',
                          )}
                        </span>

                        <div className="min-w-0">
                          <h2
                            id={`legal-heading-${index + 1
                              }`}
                            className="text-2xl font-bold leading-tight tracking-[-0.025em] text-ink sm:text-[1.75rem]"
                          >
                            {
                              section.title
                            }
                          </h2>

                          <div className="mt-5 space-y-5 text-base leading-8 text-muted">
                            {section.paragraphs.map(
                              (
                                paragraph,
                              ) => (
                                <p
                                  key={
                                    paragraph
                                  }
                                >
                                  {
                                    paragraph
                                  }
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  ),
                )}

                {/* Support CTA */}

                <div className="mt-14 border-t border-line pt-8 sm:mt-16">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Need clarification?
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        We can help with
                        questions about
                        your Salif account.
                      </p>
                    </div>

                    <Link
                      to="/support"
                      className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent sm:self-auto"
                    >
                      Contact support

                      <ArrowUpRight
                        size={15}
                        aria-hidden
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}

      <PublicFooter />
    </div>
  )
}

export function PrivacyPage() {
  return (
    <LegalDocument
      type="privacy"
      eyebrow="Your information"
      title="Privacy policy"
      introduction="This policy explains the information Salif uses to provide personal finance features and protect your account."
      sections={[
        {
          title:
            'Information you provide',
          paragraphs: [
            'We process the account details you provide, such as your name, email address, time zone, and authentication information.',
            'We also process the financial information you choose to enter, including accounts, balances, transactions, categories, budgets, recurring payments, transfers, and savings goals.',
          ],
        },
        {
          title:
            'How information is used',
          paragraphs: [
            'Your information is used to operate Salif, calculate your financial summaries, maintain your account, secure your sessions, and respond to requests you make through the service.',
            'Salif does not treat the information you enter as permission to provide financial advice or make financial decisions on your behalf.',
          ],
        },
        {
          title:
            'Security information',
          paragraphs: [
            'Salif records limited technical and session information needed to authenticate requests, detect unauthorised access, support two-factor authentication, and allow sessions to be revoked.',
            'No online service can guarantee absolute security. You should use a strong, unique password and protect your recovery codes and devices.',
          ],
        },
        {
          title:
            'Sharing and retention',
          paragraphs: [
            'Information is shared only where needed to operate the service, meet legal obligations, or protect the rights and security of users and the service.',
            'Information is retained for as long as it is needed to provide the service, maintain accurate records, resolve disputes, and meet applicable obligations.',
          ],
        },
        {
          title:
            'Your choices',
          paragraphs: [
            'You can review and update supported profile and financial information from your Salif account. You can also change your password, manage two-factor authentication, and end active sessions.',
          ],
        },
      ]}
    />
  )
}

export function TermsPage() {
  return (
    <LegalDocument
      type="terms"
      eyebrow="Using Salif"
      title="Terms of use"
      introduction="These terms describe the basic rules for accessing and using Salif. By creating an account or using the service, you agree to follow them."
      sections={[
        {
          title: 'Your account',
          paragraphs: [
            'You are responsible for providing accurate registration information, protecting your sign-in credentials, and keeping access to your email account and recovery codes secure.',
            'You must notify the service operator if you believe your account has been accessed without permission.',
          ],
        },
        {
          title:
            'Acceptable use',
          paragraphs: [
            'You may use Salif only for lawful personal finance purposes. You may not attempt to disrupt the service, bypass its security controls, access another user’s information, or use the service to commit fraud or another unlawful act.',
          ],
        },
        {
          title:
            'Your financial information',
          paragraphs: [
            'You remain responsible for the information you enter and for checking that balances, transactions, budgets, goals, and reports are accurate.',
            'Salif is an organisational tool. It does not provide financial, tax, investment, or legal advice, and it should not be your only source when making important financial decisions.',
          ],
        },
        {
          title:
            'Service availability',
          paragraphs: [
            'We aim to keep Salif reliable and secure, but access may occasionally be interrupted for maintenance, security work, technical problems, or circumstances outside our control.',
            'Features may change as the service develops. Material changes to these terms will be reflected by updating this page and its revision date.',
          ],
        },
        {
          title:
            'Suspension and termination',
          paragraphs: [
            'Access may be restricted or ended when necessary to protect users or the service, respond to unlawful activity, or address a serious breach of these terms.',
          ],
        },
      ]}
    />
  )
}