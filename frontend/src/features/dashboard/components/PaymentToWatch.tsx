import {useMemo} from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  Sparkles,
} from 'lucide-react'
import {Link} from 'react-router'
import {useAccounts} from '../../accounts/hooks/useAccounts'
import type {RecurringTransactionDue} from '../api/types'
import {useRecurringTransactions} from '../../recurring/hooks/useRecurringTransactions'

interface PaymentsToWatchProps {
  dueTransactions: RecurringTransactionDue[]
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(today.getDate()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day}`
}

function parseLocalDate(value: string) {
  const [year, month, day] =
    value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function differenceInDays(
  start: string,
  end: string,
) {
  const startDate = parseLocalDate(start)
  const endDate = parseLocalDate(end)

  const startUtc = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  )

  const endUtc = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  )

  return Math.round(
    (endUtc - startUtc) /
    (1000 * 60 * 60 * 24),
  )
}

function formatMoney(
  amount: number,
  currencyCode?: string,
) {
  if (!currencyCode) {
    return new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatRelativeDate(
  date: string,
  today: string,
) {
  const difference = differenceInDays(today, date)

  if (difference === 0) {
    return 'Due today'
  }

  if (difference === 1) {
    return 'Due tomorrow'
  }

  return `Due in ${difference} days`
}

function getDateParts(value: string) {
  const date = parseLocalDate(value)

  return {
    day: new Intl.DateTimeFormat('en-ZA', {
      day: '2-digit',
    }).format(date),

    month: new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
    })
      .format(date)
      .toUpperCase(),
  }
}

export default function PaymentsToWatch({
                                          dueTransactions,
                                        }: PaymentsToWatchProps) {
  const today = getToday()

  const schedulesQuery =
    useRecurringTransactions('ACTIVE')

  const accountsQuery = useAccounts('ACTIVE')

  const accountById = useMemo(
    () =>
      new Map(
        (accountsQuery.data ?? []).map(
          (account) => [account.id, account],
        ),
      ),
    [accountsQuery.data],
  )

  const overduePayments = useMemo(
    () =>
      [...dueTransactions]
        .filter(
          (transaction) =>
            transaction.transactionType ===
            'EXPENSE' &&
            transaction.daysOverdue > 0,
        )
        .sort(
          (first, second) =>
            second.daysOverdue -
            first.daysOverdue,
        )
        .slice(0, 4),
    [dueTransactions],
  )

  const upcomingPayments = useMemo(
    () =>
      (schedulesQuery.data ?? [])
        .filter(
          (schedule) =>
            schedule.transactionType ===
            'EXPENSE' &&
            schedule.status === 'ACTIVE' &&
            schedule.nextDueDate !== null &&
            schedule.nextDueDate >= today,
        )
        .sort((first, second) =>
          (
            first.nextDueDate ?? ''
          ).localeCompare(
            second.nextDueDate ?? '',
          ),
        )
        .slice(0, 4),
    [schedulesQuery.data, today],
  )

  return (
    <section className="mt-11">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            STAY AHEAD
          </p>

          <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
            Payments to watch
          </h2>
        </div>

        <Link
          to="/recurring"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#9a6828] hover:underline hover:underline-offset-4"
        >
          Manage schedules
          <ArrowRight size={15} aria-hidden/>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="relative overflow-hidden rounded-3xl border border-[#e1c6b9] bg-[#f8ede7] p-6 sm:p-7">
          <div
            className="absolute -top-16 -right-12 size-40 rounded-full border border-[#dcae99]/30"
            aria-hidden
          />

          <div
            className="absolute top-5 right-7 size-20 rounded-full bg-[#efcfc0]/25"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#a85e49] text-white shadow-[0_8px_20px_rgba(168,94,73,0.18)]">
                <AlertTriangle size={19} aria-hidden/>
              </span>

              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-[#9a5d49]">
                  NEEDS ATTENTION
                </p>

                <h3 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-[#6e382c]">
                  Overdue payments
                </h3>
              </div>
            </div>

            <div className="relative text-right">
              <p className="font-serif text-5xl leading-none text-[#a85e49]">
                {overduePayments.length}
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#9a5d49]">
                overdue
              </p>
            </div>
          </div>

          {overduePayments.length === 0 ? (
            <div className="relative mt-8 flex items-center gap-4 rounded-2xl border border-[#e5cfc5] bg-white/55 px-5 py-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e0ece4] text-[#2d684f]">
                <Check size={18} aria-hidden/>
              </span>

              <div>
                <p className="font-semibold text-[#173c32]">
                  Nothing overdue
                </p>

                <p className="mt-1 text-xs leading-5 text-[#657972]">
                  Your scheduled payments are currently
                  on track.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {overduePayments.map((payment) => (
                <div
                  key={payment.recurringTransactionId}
                  className="rounded-2xl border border-[#e4cbbf] bg-white/65 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-[#bb6b4d]"/>

                    <span className="rounded-full bg-[#f3d8cd] px-2 py-1 text-[10px] font-bold text-[#98513d]">
                      {payment.daysOverdue}{' '}
                      {payment.daysOverdue === 1
                        ? 'day'
                        : 'days'}{' '}
                      late
                    </span>
                  </div>

                  <p className="mt-4 truncate font-semibold text-[#542f27]">
                    {payment.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-[#8b695f]">
                    {payment.categoryName ?? 'Scheduled expense'}
                  </p>

                  <p className="mt-4 font-serif text-xl text-[#a85e49]">
                    {formatMoney(
                      payment.amount,
                      payment.currencyCode,
                    )}
                  </p>

                  <p className="mt-1 truncate text-xs text-[#8b695f]">
                    {payment.accountName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-[#cdddcf] bg-[#e8f0e9] p-6 sm:p-7">
          <div
            className="absolute -bottom-20 -right-12 size-52 rounded-full border border-[#a9c6b0]/35"
            aria-hidden
          />

          <div
            className="absolute -bottom-7 right-12 size-28 rounded-full bg-white/20"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#2d684f] text-white shadow-[0_8px_20px_rgba(45,104,79,0.18)]">
                <CalendarDays size={19} aria-hidden/>
              </span>

              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-[#567267]">
                  ON THE HORIZON
                </p>

                <h3 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
                  Coming up
                </h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#2d684f]">
              <Sparkles size={11} aria-hidden/>
              Next four
            </span>
          </div>

          {schedulesQuery.isPending ? (
            <div className="relative mt-7 grid animate-pulse gap-3 sm:grid-cols-2">
              {Array.from({length: 4}).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-2xl bg-white/45"
                  />
                ),
              )}
            </div>
          ) : schedulesQuery.error ? (
            <div
              role="alert"
              className="relative mt-7 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-5 text-sm text-red-700"
            >
              Upcoming payments could not be loaded.
            </div>
          ) : upcomingPayments.length === 0 ? (
            <div className="relative mt-8 flex items-center gap-4 rounded-2xl border border-[#cdddcf] bg-white/45 px-5 py-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/70 text-[#2d684f]">
                <Check size={18} aria-hidden/>
              </span>

              <div>
                <p className="font-semibold text-[#173c32]">
                  A quiet calendar
                </p>

                <p className="mt-1 text-xs leading-5 text-[#657972]">
                  No upcoming expense schedules were
                  found.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
              {upcomingPayments.map((payment) => {
                const account = accountById.get(
                  payment.accountId,
                )

                const dateParts = getDateParts(
                  payment.nextDueDate!,
                )

                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-4 rounded-2xl border border-[#cbdccf] bg-white/55 p-4 backdrop-blur-sm transition hover:bg-white/75"
                  >
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-[#c8dbcd] bg-[#f7faf6] text-center">
                      <div>
                        <p className="text-[9px] font-bold tracking-[0.12em] text-[#668175]">
                          {dateParts.month}
                        </p>

                        <p className="font-serif text-xl leading-none text-[#173c32]">
                          {dateParts.day}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-[#173c32]">
                          {payment.name}
                        </p>

                        {payment.autoPost && (
                          <span
                            title="Posts automatically"
                            className="size-2 shrink-0 rounded-full bg-[#bd8539]"
                          />
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-[#657972]">
                        {payment.merchantName ??
                          account?.name ??
                          'Scheduled expense'}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[#2d684f]">
                          {formatRelativeDate(
                            payment.nextDueDate!,
                            today,
                          )}
                        </p>

                        <p className="font-serif text-lg text-[#173c32]">
                          {formatMoney(
                            payment.amount,
                            account?.currencyCode,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}