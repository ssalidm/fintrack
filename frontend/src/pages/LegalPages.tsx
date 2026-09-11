import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

import salifLogoGreen from '../assets/brand/salif-logo-green.svg'

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
    <div className="min-h-screen bg-[#f4f1e8] text-[#123e33]">
      <header className="border-b border-[#d9d4c8] bg-[#fffdf8]">
        <div className="mx-auto flex h-18 max-w-[1080px] items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            aria-label="Salif home"
          >
            <img
              src={salifLogoGreen}
              alt="Salif"
              className="h-auto w-27"
            />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d4f3f] transition hover:text-[#16805f]"
          >
            <ArrowLeft
              size={16}
              aria-hidden
            />

            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
          <aside>
            <p className="text-xs font-bold tracking-[0.16em] text-[#16805f]">
              {eyebrow}
            </p>

            <h1 className="mt-4 font-serif text-5xl tracking-[-0.04em] text-[#103b30]">
              {title}
            </h1>

            <p className="mt-4 text-sm text-[#657972]">
              Last updated 11 September 2026
            </p>
          </aside>

          <article className="rounded-[2rem] border border-[#d9d4c8] bg-[#fffdf8] p-6 shadow-[0_18px_50px_rgba(18,62,51,0.06)] sm:p-9">
            <p className="text-lg leading-8 text-[#405f55]">
              {introduction}
            </p>

            <div className="mt-9 space-y-9 border-t border-[#e3dfd5] pt-9">
              {sections.map(
                (section) => (
                  <section
                    key={
                      section.title
                    }
                  >
                    <h2 className="font-serif text-2xl text-[#103b30]">
                      {
                        section.title
                      }
                    </h2>

                    <div className="mt-3 space-y-3 text-base leading-7 text-[#566f66]">
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
                  </section>
                ),
              )}
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#092f28]">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-5 py-7 text-xs text-[#8fb3a6] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()}{' '}
            Salif. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              to="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="YOUR INFORMATION"
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
      eyebrow="USING SALIF"
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