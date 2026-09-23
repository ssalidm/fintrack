import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="feature-reveal flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="type-eyebrow">
          {eyebrow}
        </p>

        <h1 className="type-page-title mt-3">
          {title}
        </h1>

        {description && (
          <p className="type-body mt-3 max-w-2xl sm:text-base">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  )
}