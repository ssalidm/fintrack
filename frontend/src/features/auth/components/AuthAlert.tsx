import type {
  PropsWithChildren,
} from 'react'

interface AuthAlertProps
  extends PropsWithChildren {
  readonly variant?:
    | 'error'
    | 'success'
}

export default function AuthAlert({
  children,
  variant = 'error',
}: AuthAlertProps) {
  const styles =
    variant === 'success'
      ? `
        border-success/30
        bg-success-soft
        text-success
      `
      : `
        border-danger/30
        bg-danger-soft
        text-danger
      `

  return (
    <div
      className={`
        rounded-lg
        border
        px-3.5 py-3
        text-sm
        leading-5
        ${styles}
      `}
      role={
        variant === 'error'
          ? 'alert'
          : 'status'
      }
    >
      {children}
    </div>
  )
}