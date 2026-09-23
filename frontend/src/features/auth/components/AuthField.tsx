import type {
  PropsWithChildren,
  ReactNode,
} from 'react'

interface AuthFieldProps
  extends PropsWithChildren {
  readonly label: string
  readonly htmlFor: string

  readonly error?: string
  readonly hint?: ReactNode

  readonly optional?: boolean
  readonly action?: ReactNode
}

export default function AuthField({
  label,
  htmlFor,
  error,
  hint,
  optional = false,
  action,
  children,
}: AuthFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-[#173c32]"
        >
          {label}

          {optional && (
            <span className="ml-1 font-normal text-[#8a958f]">
              (optional)
            </span>
          )}
        </label>

        {action}
      </div>

      <div className="mt-1.5">
        {children}
      </div>

      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="mt-1.5 text-xs leading-5 text-red-600"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <div className="mt-1.5 text-xs leading-5 text-[#78867f]">
          {hint}
        </div>
      ) : null}
    </div>
  )
}