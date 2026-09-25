import type {
  ChangeEvent,
  FocusEventHandler,
  Ref,
} from 'react'

interface OtpCodeInputProps {
  id: string
  name: string
  value: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  inputRef?: Ref<HTMLInputElement>

  onBlur: FocusEventHandler<HTMLInputElement>

  onChange: (value: string) => void
}

const CODE_LENGTH = 6

export default function OtpCodeInput({
  id,
  name,
  value,
  disabled = false,
  invalid = false,
  describedBy,
  inputRef,
  onBlur,
  onChange,
}: OtpCodeInputProps) {
  function handleChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const digits = event.target.value
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)

    onChange(digits)
  }

  const activeIndex = Math.min(
    value.length,
    CODE_LENGTH - 1,
  )

  return (
    <div
      className={[
        'relative mx-auto flex w-fit gap-1.5 rounded-xl sm:gap-2',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent/25 focus-within:ring-offset-2',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH}
        value={value}
        disabled={disabled}
        aria-invalid={
          invalid ? 'true' : 'false'
        }
        aria-describedby={
          describedBy
        }
        onBlur={onBlur}
        onChange={handleChange}
        className="absolute inset-0 z-10 size-full cursor-text rounded-xl text-transparent caret-transparent outline-none disabled:cursor-not-allowed"
      />

      {Array.from({
        length: CODE_LENGTH,
      }).map((_, index) => {
        const digit =
          value[index] ?? ''

        const isActive =
          index === activeIndex

        return (
          <span
            key={index}
            aria-hidden
            className={[
              'grid size-10 place-items-center rounded-xl border bg-surface font-mono text-xl font-semibold text-ink transition sm:size-12',

              invalid
                ? 'border-danger bg-danger-soft'
                : isActive
                  ? 'border-accent shadow-[0_0_0_1px_rgba(31,122,92,0.12)]'
                  : digit
                    ? 'border-line-strong bg-accent-soft'
                    : 'border-line',
            ].join(' ')}
          >
            {digit}
          </span>
        )
      })}
    </div>
  )
}