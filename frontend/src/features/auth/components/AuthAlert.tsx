import type {
  PropsWithChildren,
} from 'react'

interface AuthAlertProps
  extends PropsWithChildren {
  readonly variant?: 'error' | 'success'
}

export default function AuthAlert({
  children,
  variant = 'error',
}: AuthAlertProps) {
  const styles =
    variant === 'success'
      ? `
        border-[#cde2d7]
        bg-[#eef6f1]
        text-[#315f4f]
      `
      : `
        border-red-200
        bg-red-50
        text-red-700
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