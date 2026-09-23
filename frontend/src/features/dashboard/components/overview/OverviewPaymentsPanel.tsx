import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'

import { formatMoney } from '../../../../utils/formatters'
import { useAccounts } from '../../../accounts/hooks/useAccounts'
import { useRecurringTransactions } from '../../../recurring/hooks/useRecurringTransactions'
import type { RecurringTransactionDue } from '../../api/types'

interface OverviewPaymentsPanelProps {
  readonly dueTransactions: RecurringTransactionDue[]
}

function localDateKey() {
  const date = new Date()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function formatDate(
  value: string,
) {
  const [year, month, day] =
    value.split('-').map(Number)

  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: 'numeric',
      month: 'short',
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  )
}

export default function OverviewPaymentsPanel({
  dueTransactions,
}: OverviewPaymentsPanelProps) {
  const recurringQuery =
    useRecurringTransactions('ACTIVE')

  const accountsQuery =
    useAccounts('ACTIVE')

  const accountById = useMemo(
    () =>
      new Map(
        (
          accountsQuery.data ?? []
        ).map((account) => [
          account.id,
          account,
        ]),
      ),
    [accountsQuery.data],
  )

  const overdue = useMemo(
    () =>
      dueTransactions
        .filter(
          (item) =>
            item.transactionType ===
              'EXPENSE' &&
            item.daysOverdue > 0,
        )
        .toSorted(
          (left, right) =>
            right.daysOverdue -
            left.daysOverdue,
        )
        .slice(0, 2),
    [dueTransactions],
  )

  const today =
    localDateKey()

  const upcoming =
    useMemo(
      () =>
        (
          recurringQuery.data ?? []
        )
          .filter(
            (item) =>
              item.transactionType ===
                'EXPENSE' &&
              item.status ===
                'ACTIVE' &&
              item.nextDueDate !==
                null &&
              item.nextDueDate >=
                today,
          )
          .toSorted(
            (left, right) =>
              (
                left.nextDueDate ??
                ''
              ).localeCompare(
                right.nextDueDate ??
                  '',
              ),
          )
          .slice(
            0,
            overdue.length > 0
              ? 2
              : 4,
          ),
      [
        overdue.length,
        recurringQuery.data,
        today,
      ],
    )

  return (
    <section
      className="
        rounded-2xl
        border border-line/50
        bg-surface
        p-5
        shadow-[0_10px_30px_rgba(23,60,50,0.05)]
      "
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-ink">
          Payments to watch
        </h2>

        <Link
          to="/recurring"
          className="
            inline-flex
            items-center
            gap-1.5
            text-xs font-semibold
            text-accent
            transition
            hover:text-primary
          "
        >
          Manage

          <ArrowRight
            size={13}
            aria-hidden
          />
        </Link>
      </div>

      {overdue.length > 0 && (
        <div className="mt-4 rounded-xl bg-danger-soft/70 px-3.5 py-3">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle
              size={15}
              aria-hidden
            />

            <p className="text-xs font-semibold">
              {overdue.length}{' '}
              overdue
            </p>
          </div>

          <div className="mt-2 space-y-2">
            {overdue.map(
              (item) => (
                <div
                  key={
                    item.recurringTransactionId
                  }
                  className="flex items-center justify-between gap-3"
                >
                  <p className="truncate text-xs font-medium text-ink">
                    {item.name}
                  </p>

                  <p className="shrink-0 text-xs font-semibold text-danger">
                    {item.daysOverdue}{' '}
                    {item.daysOverdue ===
                    1
                      ? 'day'
                      : 'days'}{' '}
                    late
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {recurringQuery.isPending && (
        <div className="mt-4 space-y-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg bg-surface-muted"
            />
          ))}
        </div>
      )}

      {recurringQuery.isError && (
        <p
          role="alert"
          className="mt-5 text-sm text-danger"
        >
          Upcoming payments could not
          be loaded.
        </p>
      )}

      {recurringQuery.isSuccess &&
        upcoming.length === 0 &&
        overdue.length === 0 && (
          <p className="mt-5 text-sm leading-6 text-muted">
            No upcoming payments need
            your attention.
          </p>
        )}

      {upcoming.length > 0 && (
        <div className="mt-4 divide-y divide-line/50">
          {upcoming.map(
            (item) => {
              const account =
                accountById.get(
                  item.accountId,
                )

              return (
                <div
                  key={item.id}
                  className="
                    grid
                    grid-cols-[auto_minmax(0,1fr)]
                    gap-3
                    py-3
                  "
                >
                  <span
                    className="
                      grid size-9
                      place-items-center
                      rounded-lg
                      bg-accent-soft
                      text-accent
                    "
                  >
                    <CalendarDays
                      size={15}
                      aria-hidden
                    />
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-ink">
                        {item.name}
                      </p>

                      <p className="shrink-0 text-xs font-semibold text-ink">
                        {formatMoney(
                          item.amount,
                          account?.currencyCode,
                        )}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-subtle">
                      {formatDate(
                        item.nextDueDate!,
                      )}
                      {' · '}
                      {account?.name ??
                        'Scheduled expense'}
                    </p>
                  </div>
                </div>
              )
            },
          )}
        </div>
      )}
    </section>
  )
}
