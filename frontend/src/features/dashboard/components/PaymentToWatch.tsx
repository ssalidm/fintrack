import { useMemo } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
} from 'lucide-react'
import { Link } from 'react-router'

import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useRecurringTransactions } from '../../recurring/hooks/useRecurringTransactions'
import type { RecurringTransactionDue } from '../api/types'

interface PaymentsToWatchProps {
  dueTransactions: RecurringTransactionDue[]
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    today.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseLocalDate(value: string) {
  const [year, month, day] =
    value.split('-').map(Number)

  return new Date(
    year,
    month - 1,
    day,
  )
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
    return new Intl.NumberFormat(
      'en-ZA',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(amount)
  }

  return new Intl.NumberFormat(
    'en-ZA',
    {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    },
  ).format(amount)
}

function formatRelativeDate(
  date: string,
  today: string,
) {
  const difference =
    differenceInDays(today, date)

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
    day: new Intl.DateTimeFormat(
      'en-ZA',
      {
        day: '2-digit',
      },
    ).format(date),

    month: new Intl.DateTimeFormat(
      'en-ZA',
      {
        month: 'short',
      },
    )
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

  const accountsQuery =
    useAccounts('ACTIVE')

  const accountById = useMemo(
    () =>
      new Map(
        (accountsQuery.data ?? []).map(
          (account) => [
            account.id,
            account,
          ],
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
        ),
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
          <ArrowRight
            size={15}
            aria-hidden
          />
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] shadow-[0_18px_50px_rgba(34,57,48,0.09)] xl:grid xl:grid-cols-[0.85fr_1.15fr]">
        <article className="relative overflow-hidden bg-[#94513f] px-6 py-7 text-[#fff8f2] sm:px-8 sm:py-9">
          <div
            className="absolute -right-20 -top-24 size-64 rounded-full border border-white/10"
            aria-hidden
          />

          <div
            className="absolute -right-6 -top-10 size-36 rounded-full bg-white/5"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#f0c8b8]">
                <AlertTriangle
                  size={16}
                  aria-hidden
                />
                NEEDS ATTENTION
              </span>

              <h3 className="mt-3 font-serif text-3xl tracking-[-0.025em]">
                Overdue
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#efd8cf]">
                Payments that have passed
                their scheduled date.
              </p>
            </div>

            <div className="relative text-right">
              <p className="font-serif text-6xl leading-none">
                {overduePayments.length}
              </p>

              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f0c8b8]">
                outstanding
              </p>
            </div>
          </div>

          {overduePayments.length === 0 ? (
            <div className="relative mt-8 flex items-center gap-4 border-t border-white/20 pt-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/12 text-white">
                <Check
                  size={18}
                  aria-hidden
                />
              </span>

              <div>
                <p className="font-semibold">
                  Nothing overdue
                </p>

                <p className="mt-1 text-sm text-[#efd8cf]">
                  Your scheduled payments
                  are currently on track.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative mt-7 divide-y divide-white/15 border-t border-white/20">
              {overduePayments
                .slice(0, 4)
                .map((payment) => (
                  <div
                    key={
                      payment.recurringTransactionId
                    }
                    className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full bg-[#ffd2bf]" />

                        <p className="truncate font-semibold">
                          {payment.name}
                        </p>
                      </div>

                      <p className="mt-1 truncate pl-4 text-xs text-[#efd8cf]">
                        {payment.accountName}
                        <span aria-hidden>
                          {' '}·{' '}
                        </span>
                        {payment.categoryName ??
                          'Scheduled expense'}
                      </p>
                    </div>

                    <div className="pl-4 sm:pl-0 sm:text-right">
                      <p className="font-serif text-xl">
                        {formatMoney(
                          payment.amount,
                          payment.currencyCode,
                        )}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#ffd2bf]">
                        {payment.daysOverdue}{' '}
                        {payment.daysOverdue ===
                        1
                          ? 'day'
                          : 'days'}{' '}
                        late
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </article>

        <article className="bg-[#edf2ec] px-6 py-7 text-[#173c32] sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#527064]">
                <CalendarDays
                  size={16}
                  aria-hidden
                />
                ON THE HORIZON
              </span>

              <h3 className="mt-3 font-serif text-3xl tracking-[-0.025em]">
                Coming up
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#657972]">
                The next scheduled expenses
                on your calendar.
              </p>
            </div>

            <p className="rounded-full border border-[#cad9ce] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#39725d]">
              Next four
            </p>
          </div>

          {schedulesQuery.isPending ? (
            <div className="mt-7 divide-y divide-[#ced9d1] border-t border-[#ced9d1]">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse bg-white/20"
                />
              ))}
            </div>
          ) : schedulesQuery.error ? (
            <p
              role="alert"
              className="mt-7 border-t border-[#ced9d1] pt-6 text-sm text-[#9a4f3f]"
            >
              Upcoming payments could not
              be loaded.
            </p>
          ) : upcomingPayments.length ===
            0 ? (
            <div className="mt-8 flex items-center gap-4 border-t border-[#ced9d1] pt-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/70 text-[#2d684f]">
                <Check
                  size={18}
                  aria-hidden
                />
              </span>

              <div>
                <p className="font-semibold">
                  A quiet calendar
                </p>

                <p className="mt-1 text-sm text-[#657972]">
                  No upcoming expense
                  schedules were found.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-7 divide-y divide-[#ced9d1] border-t border-[#ced9d1]">
              {upcomingPayments.map(
                (payment) => {
                  const account =
                    accountById.get(
                      payment.accountId,
                    )

                  const dateParts =
                    getDateParts(
                      payment.nextDueDate!,
                    )

                  return (
                    <div
                      key={payment.id}
                      className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <div className="border-r border-[#c3d2c7] pr-4 text-center">
                        <p className="text-[9px] font-bold tracking-[0.14em] text-[#668175]">
                          {dateParts.month}
                        </p>

                        <p className="mt-1 font-serif text-2xl leading-none">
                          {dateParts.day}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold">
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

                        <p className="mt-1 text-xs font-semibold text-[#39725d] sm:hidden">
                          {formatRelativeDate(
                            payment.nextDueDate!,
                            today,
                          )}
                        </p>
                      </div>

                      <div className="col-start-2 sm:col-start-auto sm:text-right">
                        <p className="font-serif text-xl">
                          {formatMoney(
                            payment.amount,
                            account?.currencyCode,
                          )}
                        </p>

                        <p className="mt-1 hidden text-xs font-semibold text-[#39725d] sm:block">
                          {formatRelativeDate(
                            payment.nextDueDate!,
                            today,
                          )}
                        </p>
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}