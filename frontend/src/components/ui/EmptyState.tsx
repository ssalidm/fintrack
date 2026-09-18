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
  iconClassName = 'bg-[#e0ece4] text-[#2d684f]',
  className = '',
}: EmptyStateProps) {
  const panelClasses =
    variant === 'solid'
      ? 'border-[#dedbd2] py-16'
      : 'border-dashed border-[#cfcac0] py-14'

  const descriptionSpacing =
    variant === 'solid' ? 'mt-3' : 'mt-2'

  return (
    <section
      className={`rounded-3xl border bg-[#fffdf8] px-6 text-center ${panelClasses} ${className}`}
    >
      <span
        className={`mx-auto grid size-14 place-items-center rounded-full ${iconClassName}`}
      >
        {icon}
      </span>

      <h2 className="mt-5 font-serif text-3xl text-[#173c32]">
        {title}
      </h2>

      <p
        className={`mx-auto max-w-md text-sm leading-6 text-[#657972] ${descriptionSpacing}`}
      >
        {description}
      </p>

      {action}
    </section>
  )
}