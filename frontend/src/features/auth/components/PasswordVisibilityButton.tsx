interface PasswordVisibilityButtonProps {
  visible: boolean
  fieldLabel: string
  onToggle: () => void
}

export default function PasswordVisibilityButton({
                                                   visible,
                                                   fieldLabel,
                                                   onToggle,
                                                 }: PasswordVisibilityButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${visible ? 'Hide' : 'Show'} ${fieldLabel}`}
      aria-pressed={visible}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-[#1F7A5C] focus:outline-none focus:text-[#1F7A5C]"
    >
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {visible ? (
          <>
            <path d="m3 3 18 18"/>
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
            <path
              d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 6.1a4.3 4.3 0 0 1 0 3.8 11.8 11.8 0 0 1-2 2.9"/>
            <path
              d="M6.6 6.6A12.2 12.2 0 0 0 2.5 10a4.3 4.3 0 0 0 0 3.8C3.5 16 7 20 12 20a10.7 10.7 0 0 0 4.1-.8"/>
          </>
        ) : (
          <>
            <path
              d="M2.5 10.1a4.3 4.3 0 0 0 0 3.8C3.5 16 7 20 12 20s8.5-4 9.5-6.1a4.3 4.3 0 0 0 0-3.8C20.5 8 17 4 12 4S3.5 8 2.5 10.1Z"/>
            <circle cx="12" cy="12" r="3"/>
          </>
        )}
      </svg>
    </button>
  )
}
