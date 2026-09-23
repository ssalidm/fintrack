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
        block h-9 w-full
        rounded-md
        border
        bg-white/80
        px-3
        text-[13px]
        text-[#092f28]
        outline-none
        transition
        placeholder:text-[#9aa49f]

        ${
          hasError
            ? `
              border-red-400
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/10
            `
            : `
              border-[#c9d0cc]
              hover:border-[#adb9b3]
              focus:border-[#16805f]
              focus:ring-2
              focus:ring-[#16805f]/10
            `
        }

        disabled:cursor-not-allowed
        disabled:bg-[#f1f1ed]

        ${className}
      `}
      {...props}
    />
  )
}