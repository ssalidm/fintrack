import type { PropsWithChildren } from 'react'

import AuthIntro from './AuthIntro'

interface AuthPanelProps extends PropsWithChildren {
  readonly className?: string
}

export default function AuthPanel({
  children,
  className = '',
}: AuthPanelProps) {
  return (
    <section
      className={`
        mx-auto
        w-full
        max-w-[420px]
        rounded-2xl
        border border-white/70
        bg-white/70
        shadow-[0_20px_55px_rgba(9,47,40,0.05)]
        ring-1 ring-[#0d4f3f]/5
        backdrop-blur-xl

        lg:grid
        lg:max-w-[1040px]
        lg:grid-cols-[1fr_auto_1fr]
        lg:rounded-[28px]

        ${className}
      `}
    >
      {/* Desktop intro only */}
      <div className="hidden lg:flex lg:items-center lg:px-12 lg:py-12">
        <AuthIntro />
      </div>

      {/* divider */}
      <div
        className="hidden items-center lg:flex"
        aria-hidden="true">
        <div className="h-[60%] w-px bg-[#d9e0dc]" />
      </div>

      {/* Auth form */}
      <div className="min-w-0 px-5 py-7 sm:px-7 sm:py-8 lg:flex lg:items-center lg:px-12 lg:py-12">
        <div className="mx-auto w-full min-w-0 max-w-[350px]">
          {children}
        </div>
      </div>
    </section>
  )
}