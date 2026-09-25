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
        auth-panel-enter
        mx-auto
        w-full
        max-w-[420px]
        rounded-2xl
        border border-line
        bg-surface/82
        shadow-[var(--salif-shadow-panel)]
        backdrop-blur-xl

        lg:grid
        lg:max-w-[1040px]
        lg:grid-cols-[1fr_auto_1fr]
        lg:rounded-[28px]

        ${className}
      `}
    >
      <div className="hidden lg:flex lg:items-center">
        <AuthIntro />
      </div>

      <div
        className="hidden items-center lg:flex"
        aria-hidden
      >
        <div className="h-[60%] w-px bg-line" />
      </div>

      <div className="min-w-0 px-5 py-7 sm:px-7 sm:py-8 lg:flex lg:items-center lg:px-12 lg:py-12">
        <div className="mx-auto w-full min-w-0 max-w-[350px]">
          {children}
        </div>
      </div>
    </section>
  )
}