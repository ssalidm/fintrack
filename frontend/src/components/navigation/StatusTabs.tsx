interface StatusTabOption<T extends string> {
  value: T
  label: string
}

interface StatusTabsProps<T extends string> {
  value: T
  options: ReadonlyArray<StatusTabOption<T>>
  onChange: (value: T) => void
  ariaLabel: string
  variant?: 'underline' | 'pill'
}

export default function StatusTabs<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  variant = 'underline',
}: StatusTabsProps<T>) {
  const isUnderline = variant === 'underline'

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={
        isUnderline
          ? 'flex w-full gap-7 border-b border-[#dedbd2]'
          : 'inline-flex w-fit max-w-full flex-wrap gap-1 rounded-full bg-[#eceae3] p-1'
      }
    >
      {options.map((option) => {
        const isSelected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={
              isUnderline
                ? `cursor-pointer border-b-2 px-1 pb-4 text-sm font-semibold transition ${
                    isSelected
                      ? 'border-[#39725d] text-[#173c32]'
                      : 'border-transparent text-[#7a8984] hover:text-[#173c32]'
                  }`
                : `cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-[#174f43] text-white shadow-sm'
                      : 'text-[#657972] hover:text-[#173c32]'
                  }`
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}