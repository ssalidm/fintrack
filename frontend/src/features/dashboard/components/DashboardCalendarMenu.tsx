import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

interface DashboardCalendarMenuProps {
  readonly isOpen: boolean
  readonly onToggle: () => void
  readonly onClose: () => void
}

const weekdayLabels = [
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'Sa',
  'Su',
] as const

function formatToday() {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(new Date())
}

function formatMonth(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      month: 'long',
      year: 'numeric',
    },
  ).format(date)
}

function sameDay(
  left: Date,
  right: Date,
) {
  return (
    left.getFullYear() ===
      right.getFullYear() &&
    left.getMonth() ===
      right.getMonth() &&
    left.getDate() ===
      right.getDate()
  )
}

function calendarCells(
  month: Date,
) {
  const year =
    month.getFullYear()

  const monthIndex =
    month.getMonth()

  const firstDay =
    new Date(
      year,
      monthIndex,
      1,
    )

  const mondayFirstOffset =
    (firstDay.getDay() + 6) % 7

  const numberOfDays =
    new Date(
      year,
      monthIndex + 1,
      0,
    ).getDate()

  return [
    ...Array.from(
      {
        length:
          mondayFirstOffset,
      },
      () => null,
    ),
    ...Array.from(
      {
        length:
          numberOfDays,
      },
      (_, index) =>
        new Date(
          year,
          monthIndex,
          index + 1,
        ),
    ),
  ]
}

export default function DashboardCalendarMenu({
  isOpen,
  onToggle,
  onClose,
}: DashboardCalendarMenuProps) {
  const today =
    new Date()

  const [
    visibleMonth,
    setVisibleMonth,
  ] = useState(
    () =>
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
  )

  const containerRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(
      event: MouseEvent,
    ) {
      if (
        !containerRef.current?.contains(
          event.target as Node,
        )
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener(
        'mousedown',
        handlePointerDown,
      )
    }

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      )
    }
  }, [
    isOpen,
    onClose,
  ])

  const cells =
    calendarCells(
      visibleMonth,
    )

  function moveMonth(
    amount: number,
  ) {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() +
            amount,
          1,
        ),
    )
  }

  function showToday() {
    const now =
      new Date()

    setVisibleMonth(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative hidden xl:block"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open calendar"
        aria-expanded={isOpen}
        className="
          flex
          cursor-pointer
          items-center
          gap-2
          rounded-full
          border border-line/50
          bg-app/70
          px-3 py-2
          text-xs font-medium
          text-ink
          transition
          hover:border-accent/50
          hover:bg-surface
        "
      >
        <CalendarDays
          size={17}
          className="text-subtle"
          aria-hidden
        />

        {formatToday()}
      </button>

      {isOpen && (
        <div
          className="
            absolute
            right-0 top-12
            w-[320px]
            rounded-2xl
            border border-line/60
            bg-surface/98
            p-4
            shadow-[0_20px_55px_rgba(23,60,50,0.16)]
            backdrop-blur-xl
          "
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                moveMonth(-1)
              }
              className="
                grid size-8
                cursor-pointer
                place-items-center
                rounded-full
                text-muted
                transition
                hover:bg-surface-muted
                hover:text-ink
              "
              aria-label="Previous month"
            >
              <ChevronLeft
                size={16}
                aria-hidden
              />
            </button>

            <p className="text-sm font-semibold text-ink">
              {formatMonth(
                visibleMonth,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                moveMonth(1)
              }
              className="
                grid size-8
                cursor-pointer
                place-items-center
                rounded-full
                text-muted
                transition
                hover:bg-surface-muted
                hover:text-ink
              "
              aria-label="Next month"
            >
              <ChevronRight
                size={16}
                aria-hidden
              />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {weekdayLabels.map(
              (label) => (
                <span
                  key={label}
                  className="
                    grid h-7
                    place-items-center
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-subtle
                  "
                >
                  {label}
                </span>
              ),
            )}

            {cells.map(
              (date, index) => {
                if (!date) {
                  return (
                    <span
                      key={`blank-${index}`}
                      className="size-9"
                      aria-hidden
                    />
                  )
                }

                const isToday =
                  sameDay(
                    date,
                    today,
                  )

                return (
                  <span
                    key={
                      date.toISOString()
                    }
                    className={`
                      grid size-9
                      place-items-center
                      rounded-full
                      text-xs font-medium
                      ${
                        isToday
                          ? 'bg-primary text-inverse shadow-sm'
                          : 'text-ink'
                      }
                    `}
                    aria-current={
                      isToday
                        ? 'date'
                        : undefined
                    }
                  >
                    {date.getDate()}
                  </span>
                )
              },
            )}
          </div>

          <div className="mt-4 border-t border-line/50 pt-3">
            <button
              type="button"
              onClick={showToday}
              className="
                cursor-pointer
                text-xs font-semibold
                text-accent
                transition
                hover:text-primary
              "
            >
              Back to today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
