import type {
  ComponentPropsWithRef,
} from 'react'

interface AuthInputProps
  extends ComponentPropsWithRef<'input'> {
  readonly hasError?: boolean
}

export default function AuthInput({
  hasError = false,
  className = '',
  ...props
}: AuthInputProps) {
  return (
    <input
      className={`
        block h-10 w-full
        rounded-lg
        border
        bg-app
        px-3
        text-[13px]
        text-ink
        outline-none
        transition
        placeholder:text-subtle

        ${
          hasError
            ? `
              border-danger
              focus:border-danger
              focus:ring-2
              focus:ring-danger/15
            `
            : `
              border-line
              hover:border-line-strong
              focus:border-accent
              focus:ring-2
              focus:ring-accent/15
            `
        }

        disabled:cursor-not-allowed
        disabled:bg-surface-muted
        disabled:text-subtle

        ${className}
      `}
      {...props}
    />
  )
}