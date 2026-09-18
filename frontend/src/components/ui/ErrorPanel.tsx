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
      className={`rounded-2xl border border-red-200 bg-red-50 p-6 ${className}`}
    >
      <h2 className="font-serif text-2xl text-red-950">
        {title}
      </h2>

      <p className="mt-2 text-sm text-red-700">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
        >
          Try again
        </button>
      )}
    </section>
  )
}