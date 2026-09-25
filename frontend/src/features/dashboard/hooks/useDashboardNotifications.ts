import { useMemo } from 'react'

import { useRecurringTransactions } from '@/features/recurring/hooks/useRecurringTransactions'
import { useDashboardSummary } from './useDashboardSummary'

function formatLocalDate(
  date: Date,
) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function useDashboardNotifications() {
  const summaryQuery =
    useDashboardSummary()

  const recurringQuery =
    useRecurringTransactions('ACTIVE')

  return useMemo(() => {
    const dueCount =
      summaryQuery.data
        ?.dueRecurringTransactionCount ??
      0

    const today = new Date()

    const horizon = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7,
    )

    const todayKey =
      formatLocalDate(today)

    const horizonKey =
      formatLocalDate(horizon)

    const upcomingCount = (
      recurringQuery.data ?? []
    ).filter(
      (schedule) =>
        schedule.transactionType ===
          'EXPENSE' &&
        schedule.status === 'ACTIVE' &&
        schedule.nextDueDate !== null &&
        schedule.nextDueDate >
          todayKey &&
        schedule.nextDueDate <=
          horizonKey,
    ).length

    return {
      dueCount,
      upcomingCount,
      total:
        dueCount +
        upcomingCount,
    }
  }, [
    recurringQuery.data,
    summaryQuery.data,
  ])
}
