import {
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

import { ApiClientError } from '../api/ApiClientError'
import BudgetPulseCard from '../features/dashboard/components/BudgetPulseCard'
import CashFlowChart from '../features/dashboard/components/CashFlowChart'
import MonthlyCashFlowCard from '../features/dashboard/components/MonthlyCashFlowCard'
import NetWorthCard from '../features/dashboard/components/NetWorthCard'
import PaymentsToWatch from '../features/dashboard/components/PaymentToWatch'
import RecentTransactionsCard from '../features/dashboard/components/RecentTransactionsCard'
import TopSpendingCard from '../features/dashboard/components/TopSpendingCard'
import type { DashboardSummary } from '../features/dashboard/api/types'
import { useDashboardSummary } from '../features/dashboard/hooks/useDashboardSummary'
import { useProfile } from '../features/profile/hooks/useProfile'

function parseLocalDate(value: string) {
  const [year, month, day] = value
    .split('-')
    .map(Number)

  return new Date(year, month - 1, day)
}

function formatHeaderDate(value: string) {
  return new Intl.DateTimeFormat('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(parseLocalDate(value))
    .toUpperCase()
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

function getDashboardInsight(
  summary: DashboardSummary,
) {
  if (summary.totalAccountCount === 0) {
    return {
      title: 'Your financial space is ready.',
      description:
        'Add your first account to start building your complete financial picture.',
    }
  }

  if (
    summary.dueRecurringTransactionCount > 0
  ) {
    const count =
      summary.dueRecurringTransactionCount

    return {
      title: `${count} recurring ${
        count === 1
          ? 'payment needs'
          : 'payments need'
      } your attention.`,
      description:
        'Take a look below so that nothing important catches you by surprise.',
    }
  }

  const cashFlowIsPositive =
    summary.currentMonthCashFlow.length > 0 &&
    summary.currentMonthCashFlow.every(
      (cashFlow) =>
        cashFlow.netCashFlow >= 0,
    )

  if (cashFlowIsPositive) {
    return {
      title: 'Your money is in a good place.',
      description:
        'Your monthly cash flow is positive across your tracked currencies.',
    }
  }

  return {
    title:
      'Your financial picture is up to date.',
    description:
      'Everything has been checked and your latest figures are ready below.',
  }
}

function DashboardSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="h-20 rounded-2xl bg-[#e5e8e1]" />

      <div className="mt-6 grid gap-5 xl:grid-cols-12">
        <div className="h-64 rounded-3xl bg-[#e5e8e1] xl:col-span-5" />
        <div className="h-64 rounded-3xl bg-[#e5e8e1] xl:col-span-4" />
        <div className="h-64 rounded-3xl bg-[#e5e8e1] xl:col-span-3" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[2fr_0.9fr]">
        <div className="h-[330px] rounded-3xl bg-[#e5e8e1]" />
        <div className="h-[330px] rounded-3xl bg-[#e5e8e1]" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const {
    data: summary,
    error,
    isPending,
    isFetching,
    refetch,
  } = useDashboardSummary()

  const { data: profile } = useProfile()

  const firstName =
    profile?.firstName ?? 'there'

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : 'Unable to load your dashboard.'

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
              {summary
                ? formatHeaderDate(
                    summary.asOfDate,
                  )
                : 'YOUR FINANCIAL OVERVIEW'}
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-none tracking-[-0.03em] text-[#173c32] sm:text-5xl lg:text-6xl">
              {getGreeting()}, {firstName}.
            </h1>
          </div>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="flex cursor-pointer items-center gap-3 rounded-full border border-[#dedbd2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#173c32] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {isFetching
                ? 'Refreshing…'
                : 'Refresh'}
            </span>

            <RefreshCw
              size={15}
              className={
                isFetching
                  ? 'animate-spin'
                  : ''
              }
              aria-hidden
            />
          </button>
        </header>

        {isPending && (
          <DashboardSkeleton />
        )}

        {error && (
          <section
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-7"
            role="alert"
          >
            <h2 className="font-serif text-2xl text-red-950">
              We couldn’t load your dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again

              <ArrowRight
                size={15}
                aria-hidden
              />
            </button>
          </section>
        )}

        {summary && (
          <>
            <DashboardContent
              summary={summary}
            />

            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#dedbd2] py-6 text-xs text-[#657972]">
              <p>
                Salif keeps your financial
                information private and secure.
              </p>

              <p>
                Last synced just now
                {isFetching &&
                  ' · refreshing'}
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}

interface DashboardContentProps {
  summary: DashboardSummary
}

function DashboardContent({
  summary,
}: DashboardContentProps) {
  const insight =
    getDashboardInsight(summary)

  return (
    <>
      <section className="mt-8 flex items-start gap-4 rounded-2xl bg-[#dfece3] px-6 py-4 text-[#173c32]">
        <Sparkles
          size={18}
          className="mt-0.5 shrink-0 text-[#bd8539]"
          aria-hidden
        />

        <div>
          <h2 className="text-sm font-bold">
            {insight.title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#4f6d63]">
            {insight.description}
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <NetWorthCard
            items={
              summary.netWorthByCurrency
            }
          />
        </div>

        <div className="xl:col-span-4">
          <MonthlyCashFlowCard
            items={
              summary.currentMonthCashFlow
            }
          />
        </div>

        <div className="lg:col-span-2 xl:col-span-3">
          <BudgetPulseCard />
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(290px,0.9fr)]">
        <CashFlowChart />
        <TopSpendingCard />
      </section>

      <RecentTransactionsCard />

      <PaymentsToWatch
        dueTransactions={
          summary.dueRecurringTransactions
        }
      />
    </>
  )
}