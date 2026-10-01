interface AuthDividerProps {
  readonly label?: string
}

export default function AuthDivider({
  label = 'or',
}: AuthDividerProps) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />

      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
        {label}
      </span>

      <span className="h-px flex-1 bg-line" />
    </div>
  )
}