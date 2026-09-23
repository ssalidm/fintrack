import {
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router'

import { ApiClientError } from '../api/ApiClientError'
import PageShell from '../components/layout/PageShell'
import OverviewAccountsPanel from '../features/dashboard/components/overview/OverviewAccountsPanel'
import OverviewBalancePanel from '../features/dashboard/components/overview/OverviewBalancePanel'
import OverviewCashFlowPanel from '../features/dashboard/components/overview/OverviewCashFlowPanel'
import OverviewPaymentsPanel from '../features/dashboard/components/overview/OverviewPaymentsPanel'
import OverviewRecentTransactions from '../features/dashboard/components/overview/OverviewRecentTransactions'
import { useDashboardSummary } from '../features/dashboard/hooks/useDashboardSummary'
import { useProfile } from '../features/profile/hooks/useProfile'

function DashboardSkeleton() {
  return (
    <div
      className="
        mt-6
        grid
        animate-pulse
        gap-4
        xl:grid-cols-[300px_minmax(0,1fr)]
      "
      aria-hidden
    >
      <div className="space-y-4">
        <div className="h-52 rounded-2xl bg-surface-strong" />
        <div className="h-64 rounded-2xl bg-surface-strong" />
      </div>

      <div className="h-[480px] rounded-2xl bg-surface-strong" />

      <div className="h-[390px] rounded-2xl bg-surface-strong xl:col-span-2" />
    </div>
  )
}

function greeting() {
  const hour =
    new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

export default function DashboardPage() {
  const {
    data: summary,
    error,
    isPending,
    isFetching,
    refetch,
  } = useDashboardSummary()

  const { data: profile } =
    useProfile()

  const name =
    profile?.preferredName?.trim() ||
    profile?.firstName ||
    'there'

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : 'Unable to load your dashboard.'

  return (
    <PageShell>
      <div className="dashboard-reveal">
        <h2
          className="
            text-2xl
            font-semibold
            tracking-[-0.025em]
            text-ink
            sm:text-3xl
          "
        >
          {greeting()}, {name}.
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Here&apos;s where your money
          stands today.
        </p>
      </div>

      {summary &&
        summary.dueRecurringTransactionCount >
          0 && (
          <div
            className="
              dashboard-reveal
              dashboard-reveal-delay-1
              mt-5
              flex
              items-start
              gap-3
              rounded-xl
              border border-warning/20
              bg-warning-soft/70
              px-4 py-3
            "
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-warning"
              aria-hidden
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {
                  summary.dueRecurringTransactionCount
                }{' '}
                recurring{' '}
                {summary.dueRecurringTransactionCount ===
                1
                  ? 'payment needs'
                  : 'payments need'}{' '}
                your attention.
              </p>

              <Link
                to="/recurring"
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-warning"
              >
                Review payments

                <ArrowRight
                  size={12}
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        )}

      {isPending && (
        <DashboardSkeleton />
      )}

      {error && (
        <section
          className="
            mt-6
            rounded-xl
            border border-danger/20
            bg-danger-soft
            p-5
          "
          role="alert"
        >
          <p className="text-sm font-semibold text-danger">
            We couldn&apos;t load your
            overview.
          </p>

          <p className="mt-1 text-sm text-danger">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              void refetch()
            }
            className="
              mt-3
              inline-flex
              cursor-pointer
              items-center
              gap-2
              text-xs font-semibold
              text-danger
              underline
              underline-offset-4
            "
          >
            Try again

            <RefreshCw
              size={13}
              className={
                isFetching
                  ? 'animate-spin'
                  : ''
              }
              aria-hidden
            />
          </button>
        </section>
      )}

      {summary && (
        <div
          className="
            dashboard-reveal
            dashboard-reveal-delay-2
            mt-6
            grid
            gap-4
            xl:grid-cols-[300px_minmax(0,1fr)]
          "
        >
          <div className="space-y-4">
            <OverviewBalancePanel
              summary={summary}
            />

            <OverviewAccountsPanel />
          </div>

          <OverviewCashFlowPanel />

          <div
            className="
              grid
              gap-4
              xl:col-span-2
              xl:grid-cols-[minmax(0,1fr)_320px]
            "
          >
            <OverviewRecentTransactions />

            <OverviewPaymentsPanel
              dueTransactions={
                summary.dueRecurringTransactions
              }
            />
          </div>
        </div>
      )}
    </PageShell>
  )
}
