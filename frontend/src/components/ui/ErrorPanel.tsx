interface ErrorPanelProps {
  title: string
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorPanel({
  title,
  message,
  onRetry,
  className = '',
}: ErrorPanelProps) {
  return (
    <section
      role="alert"
      className={`
        rounded-2xl
        border border-danger/20
        bg-danger-soft
        p-5
        ${className}
      `}
    >
      <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-danger">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            mt-4
            cursor-pointer
            text-sm font-semibold
            text-danger
            underline
            underline-offset-4
          "
        >
          Try again
        </button>
      )}
    </section>
  )
}
