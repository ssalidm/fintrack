import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import PublicPageLayout from '../components/layout/PublicPageLayout'

interface LegalSection {
  title: string
  paragraphs: string[]
}

interface LegalDocumentProps {
  eyebrow: string
  title: string
  introduction: string
  sections: LegalSection[]
}

function LegalDocument({
  eyebrow,
  title,
  introduction,
  sections,
}: LegalDocumentProps) {
  return (
    <PublicPageLayout>
      <div className="mx-auto max-w-[800px]">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#16805f]">
            {eyebrow}
          </p>

          <h1 className="mt-4 font-serif text-5xl leading-tight tracking-[-0.04em] text-[#103b30] sm:text-6xl">
            {title}
          </h1>

          <p className="mt-4 text-xs text-[#657972]">
            Last updated{' '}
            <time dateTime="2026-09-11">
              11 September 2026
            </time>
          </p>

          <span
            aria-hidden
            className="mt-6 block h-1 w-12 rounded-full bg-[#d7a84d]"
          />

          <p className="mt-6 max-w-[680px] text-base leading-8 text-[#4f6a60] sm:text-lg">
            {introduction}
          </p>
        </header>

        <article
          aria-label={title}
          className="mt-9 border-t border-[#d9d4c8] pt-8 sm:mt-10 sm:pt-10"
        >
          <div className="space-y-9 sm:space-y-10">
            {sections.map((section, index) => (
              <section
                key={section.title}
                aria-labelledby={`legal-heading-${index + 1}`}
              >
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span
                    aria-hidden
                    className="shrink-0 text-xs font-semibold tabular-nums text-[#9a742e]"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <h2
                    id={`legal-heading-${index + 1}`}
                    className="font-serif text-2xl leading-tight tracking-[-0.02em] text-[#103b30] sm:text-3xl"
                  >
                    {section.title}
                  </h2>
                </div>

                <div className="mt-4 space-y-4 text-base leading-8 text-[#536d63]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#d9d4c8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#657972]">
              Have a question about your account?
            </p>

            <Link
              to="/support"
              className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-[#0d4f3f] transition hover:text-[#16805f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16805f]"
            >
              Contact support
              <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
        </article>
      </div>
    </PublicPageLayout>
  )
}

export function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Your information"
      title="Privacy policy"
      introduction="This policy explains the information Salif uses to provide personal finance features and protect your account."
      sections={[
        {
          title: 'Information you provide',
          paragraphs: [
            'We process the account details you provide, such as your name, email address, time zone, and authentication information.',
            'We also process the financial information you choose to enter, including accounts, balances, transactions, categories, budgets, recurring payments, transfers, and savings goals.',
          ],
        },
        {
          title: 'How information is used',
          paragraphs: [
            'Your information is used to operate Salif, calculate your financial summaries, maintain your account, secure your sessions, and respond to requests you make through the service.',
            'Salif does not treat the information you enter as permission to provide financial advice or make financial decisions on your behalf.',
          ],
        },
        {
          title: 'Security information',
          paragraphs: [
            'Salif records limited technical and session information needed to authenticate requests, detect unauthorised access, support two-factor authentication, and allow sessions to be revoked.',
            'No online service can guarantee absolute security. You should use a strong, unique password and protect your recovery codes and devices.',
          ],
        },
        {
          title: 'Sharing and retention',
          paragraphs: [
            'Information is shared only where needed to operate the service, meet legal obligations, or protect the rights and security of users and the service.',
            'Information is retained for as long as it is needed to provide the service, maintain accurate records, resolve disputes, and meet applicable obligations.',
          ],
        },
        {
          title: 'Your choices',
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
          title: 'Acceptable use',
          paragraphs: [
            'You may use Salif only for lawful personal finance purposes. You may not attempt to disrupt the service, bypass its security controls, access another user’s information, or use the service to commit fraud or another unlawful act.',
          ],
        },
        {
          title: 'Your financial information',
          paragraphs: [
            'You remain responsible for the information you enter and for checking that balances, transactions, budgets, goals, and reports are accurate.',
            'Salif is an organisational tool. It does not provide financial, tax, investment, or legal advice, and it should not be your only source when making important financial decisions.',
          ],
        },
        {
          title: 'Service availability',
          paragraphs: [
            'We aim to keep Salif reliable and secure, but access may occasionally be interrupted for maintenance, security work, technical problems, or circumstances outside our control.',
            'Features may change as the service develops. Material changes to these terms will be reflected by updating this page and its revision date.',
          ],
        },
        {
          title: 'Suspension and termination',
          paragraphs: [
            'Access may be restricted or ended when necessary to protect users or the service, respond to unlawful activity, or address a serious breach of these terms.',
          ],
        },
      ]}
    />
  )
}