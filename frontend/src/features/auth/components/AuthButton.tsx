import type {
  ComponentPropsWithRef,
  ReactNode,
} from 'react'

interface AuthButtonProps
  extends ComponentPropsWithRef<'button'> {
  readonly loading?: boolean
  readonly loadingLabel?: string
  readonly icon?: ReactNode
}

export default function AuthButton({
  children,
  loading = false,
  loadingLabel = 'Please wait…',
  icon,
  disabled,
  className = '',
  ...props
}: AuthButtonProps) {
  return (
    <button
      disabled={
        disabled ||
        loading
      }
      className={`
        inline-flex h-10 w-full
        items-center justify-center
        gap-2
        rounded-full
        bg-[#0d4f3f]
        px-4
        text-sm font-semibold
        text-white
        transition

        hover:bg-[#092f28]

        focus:outline-none
        focus:ring-2
        focus:ring-[#16805f]/40
        focus:ring-offset-2

        disabled:cursor-not-allowed
        disabled:opacity-60

        ${className}
      `}
      {...props}
    >
      {loading
        ? loadingLabel
        : (
          <>
            {children}
            {icon}
          </>
        )}
    </button>
  )
}