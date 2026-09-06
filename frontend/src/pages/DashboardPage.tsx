import {
  ArrowRight,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { ApiClientError } from '../api/ApiClientError'
import type { DashboardSummary } from '../features/dashboard/api/types'
import CashFlowChart from '../features/dashboard/components/CashFlowChart'
import TopSpendingCard from '../features/dashboard/components/TopSpendingCard'
import { useDashboardSummary } from '../features/dashboard/hooks/useDashboardSummary'
import { useProfile } from '../features/profile/hooks/useProfile'

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseLocalDate(value))
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

function getDashboardInsight(summary: DashboardSummary) {
  if (summary.totalAccountCount === 0) {
    return {
      title: 'Your financial space is ready.',
      description:
        'Add your first account to start building your complete financial picture.',
    }
  }

  if (summary.dueRecurringTransactionCount > 0) {
    const count = summary.dueRecurringTransactionCount

    return {
      title: `${count} recurring ${
        count === 1 ? 'payment needs' : 'payments need'
      } your attention.`,
      description:
        'Take a look below so that nothing important catches you by surprise.',
    }
  }

  const cashFlowIsPositive =
    summary.currentMonthCashFlow.length > 0 &&
    summary.currentMonthCashFlow.every(
      (cashFlow) => cashFlow.netCashFlow >= 0,
    )

  if (cashFlowIsPositive) {
    return {
      title: 'Your money is in a good place.',
      description:
        'Your monthly cash flow is positive across your tracked currencies.',
    }
  }

  return {
    title: 'Your financial picture is up to date.',
    description:
      'Everything has been checked and your latest figures are ready below.',
  }
}

function DashboardSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="h-20 rounded-2xl bg-[#e5e8e1]" />

      <div className="mt-6 grid gap-5 xl:grid-cols-12">
        <div className="h-48 rounded-3xl bg-[#e5e8e1] xl:col-span-5" />
        <div className="h-48 rounded-3xl bg-[#e5e8e1] xl:col-span-4" />
        <div className="h-48 rounded-3xl bg-[#e5e8e1] xl:col-span-3" />
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

  const firstName = profile?.firstName ?? 'there'

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
                ? formatHeaderDate(summary.asOfDate)
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
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </span>

            <RefreshCw
              size={15}
              className={isFetching ? 'animate-spin' : ''}
              aria-hidden
            />
          </button>
        </header>

        {isPending && <DashboardSkeleton />}

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
              <ArrowRight size={15} aria-hidden />
            </button>
          </section>
        )}

        {summary && (
          <>
            <DashboardContent summary={summary} />

            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#dedbd2] py-6 text-xs text-[#657972]">
              <p>
                Salif keeps your financial information private
                and secure.
              </p>

              <p>
                Last synced just now
                {isFetching && ' · refreshing'}
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
  const insight = getDashboardInsight(summary)

  const activePercentage =
    summary.totalAccountCount === 0
      ? 0
      : Math.round(
          (summary.activeAccountCount /
            summary.totalAccountCount) *
            100,
        )

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
        <article className="min-h-[190px] rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 xl:col-span-5">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            NET WORTH
          </p>

          {summary.netWorthByCurrency.length === 0 ? (
            <div className="mt-7">
              <p className="font-serif text-2xl text-[#173c32]">
                No accounts yet
              </p>

              <p className="mt-2 text-sm leading-6 text-[#657972]">
                Add an account to calculate your net worth.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {summary.netWorthByCurrency
                .slice(0, 2)
                .map((item) => (
                  <div
                    key={item.currencyCode}
                    className="flex items-end justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#657972]">
                        {item.currencyCode}
                      </p>

                      <p className="mt-1 truncate font-serif text-3xl tracking-[-0.03em] text-[#173c32]">
                        {formatMoney(
                          item.netWorth,
                          item.currencyCode,
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs text-[#657972]">
                      {item.includeAccountCount}{' '}
                      {item.includeAccountCount === 1
                        ? 'account'
                        : 'accounts'}
                    </p>
                  </div>
                ))}

              {summary.netWorthByCurrency.length > 2 && (
                <p className="text-xs text-[#657972]">
                  Plus{' '}
                  {summary.netWorthByCurrency.length - 2}{' '}
                  more currencies
                </p>
              )}
            </div>
          )}
        </article>

        <article className="min-h-[190px] rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 xl:col-span-4">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            THIS MONTH
          </p>

          {summary.currentMonthCashFlow.length === 0 ? (
            <div className="mt-7">
              <p className="font-serif text-2xl text-[#173c32]">
                No movement yet
              </p>

              <p className="mt-2 text-sm leading-6 text-[#657972]">
                Transactions will build your monthly picture.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {summary.currentMonthCashFlow
                .slice(0, 2)
                .map((item) => (
                  <div key={item.currencyCode}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#657972]">
                        {item.currencyCode}
                      </span>

                      <span
                        className={[
                          'font-serif text-2xl',
                          item.netCashFlow >= 0
                            ? 'text-[#36775d]'
                            : 'text-[#a85e49]',
                        ].join(' ')}
                      >
                        {formatMoney(
                          item.netCashFlow,
                          item.currencyCode,
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#657972]">
                      {formatMoney(
                        item.totalIncome,
                        item.currencyCode,
                      )}{' '}
                      in
                      <span aria-hidden> · </span>
                      {formatMoney(
                        item.totalExpenses,
                        item.currencyCode,
                      )}{' '}
                      out
                    </p>
                  </div>
                ))}
            </div>
          )}
        </article>

        <article className="min-h-[190px] rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 lg:col-span-2 xl:col-span-3">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            ACCOUNTS
          </p>

          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="font-serif text-4xl text-[#173c32]">
              {summary.activeAccountCount}
            </p>

            <p className="text-right text-xs text-[#657972]">
              of {summary.totalAccountCount}
              <br />
              active
            </p>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e4ebe3]">
            <div
              className="h-full rounded-full bg-[#79a486]"
              style={{
                width: `${activePercentage}%`,
              }}
            />
          </div>

          <p className="mt-5 text-sm leading-5 text-[#657972]">
            {activePercentage >= 75
              ? 'Your accounts are in good shape.'
              : activePercentage > 0
                ? 'Your portfolio is taking shape.'
                : 'Add an account to begin.'}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(290px,0.9fr)]">
        <CashFlowChart />
        <TopSpendingCard />
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              COMING UP
            </p>

            <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32] sm:text-4xl">
              Payments to watch
            </h2>
          </div>

          <p className="text-sm text-[#9a6828]">
            {summary.dueRecurringTransactionCount}{' '}
            {summary.dueRecurringTransactionCount === 1
              ? 'payment'
              : 'payments'}{' '}
            due
          </p>
        </div>

        <div className="mt-5 border-y border-[#dedbd2]">
          {summary.dueRecurringTransactions.length === 0 ? (
            <div className="flex items-center gap-4 py-8">
              <span className="grid size-10 place-items-center rounded-full bg-[#dfece3] text-[#37745e]">
                <Check size={19} aria-hidden />
              </span>

              <div>
                <p className="font-semibold text-[#173c32]">
                  You’re all caught up
                </p>

                <p className="mt-1 text-sm text-[#657972]">
                  No recurring payments currently need attention.
                </p>
              </div>
            </div>
          ) : (
            summary.dueRecurringTransactions.map(
              (item, index) => (
                <article
                  key={item.recurringTransactionId}
                  className={[
                    'grid gap-4 py-6 sm:grid-cols-[1fr_auto]',
                    'sm:items-center',
                    index > 0
                      ? 'border-t border-[#dedbd2]'
                      : '',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={[
                        'mt-2 size-2 shrink-0 rounded-full',
                        item.daysOverdue > 0
                          ? 'bg-[#bb6b4d]'
                          : 'bg-[#8fb69b]',
                      ].join(' ')}
                      aria-hidden
                    />

                    <div>
                      <p className="font-semibold text-[#173c32]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-[#657972]">
                        {item.categoryName ?? 'Uncategorised'}
                        {' · '}
                        {item.accountName}
                        {' · '}
                        {item.daysOverdue > 0
                          ? `${item.daysOverdue} ${
                              item.daysOverdue === 1
                                ? 'day'
                                : 'days'
                            } overdue`
                          : `due ${formatDate(
                              item.nextDueDate,
                            )}`}
                      </p>

                      {item.autoPost && (
                        <span className="mt-2 inline-block text-xs font-medium text-[#37745e]">
                          Posts automatically
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pl-6 text-left sm:pl-0 sm:text-right">
                    <p className="font-semibold text-[#173c32]">
                      {formatMoney(
                        item.amount,
                        item.currencyCode,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#657972]">
                      {item.frequency.toLowerCase()}
                    </p>
                  </div>
                </article>
              ),
            )
          )}
        </div>
      </section>
    </>
  )
}