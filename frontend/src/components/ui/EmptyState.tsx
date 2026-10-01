import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  variant?: 'solid' | 'dashed'
  iconClassName?: string
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'dashed',
  iconClassName = 'bg-accent-soft text-accent',
  className = '',
}: EmptyStateProps) {
  const panelClasses =
    variant === 'solid'
      ? 'border-line/50 py-12'
      : 'border-dashed border-line-strong py-12'

  return (
    <section
      className={`
        rounded-2xl
        border
        bg-surface
        px-6
        text-center
        ${panelClasses}
        ${className}
      `}
    >
      <span
        className={`
          mx-auto
          grid size-12
          place-items-center
          rounded-xl
          ${iconClassName}
        `}
      >
        {icon}
      </span>

      <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>

      {action}
    </section>
  )
}
