import {
  ArrowRight,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import {ApiClientError} from '../api/ApiClientError'
import type {DashboardSummary} from '../features/dashboard/api/types'
import {useDashboardSummary} from '../features/dashboard/hooks/useDashboardSummary'
import {useProfile} from '../features/profile/hooks/useProfile'
import CashFlowChart from '../features/dashboard/components/CashFlowChart'

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
    <div className="mt-10 animate-pulse">
      <div className="h-24 rounded-2xl bg-[#e5e8e1]"/>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_0.95fr]">
        <div className="h-96 rounded-3xl bg-[#e5e8e1]"/>
        <div className="h-96 rounded-3xl bg-[#e5e8e1]"/>
      </div>

      <div className="mt-12 h-72 rounded-3xl bg-[#e5e8e1]"/>
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

  const {data: profile} = useProfile()

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

            <h1
              className="mt-5 font-serif text-4xl leading-none tracking-[-0.03em] text-[#173c32] sm:text-5xl lg:text-6xl">
              {getGreeting()}, {firstName}.
            </h1>
          </div>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="flex items-center gap-3 rounded-full border border-[#dedbd2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#173c32] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:opacity-60"
          >
            <span>{isFetching ? 'Refreshing…' : 'Refresh'}</span>

            <RefreshCw
              size={15}
              className={isFetching ? 'animate-spin' : ''}
              aria-hidden
            />
          </button>
        </header>

        {isPending && <DashboardSkeleton/>}

        {error && (
          <section
            className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-7"
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
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
              <ArrowRight size={15} aria-hidden/>
            </button>
          </section>
        )}

        {summary && (
          <>
            <DashboardContent summary={summary}/>

            <footer
              className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-[#dedbd2] py-6 text-xs text-[#657972]">
              <p>Salif keeps your financial information private and secure.</p>

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
      <section
        className="mt-10 flex items-start gap-4 rounded-2xl bg-[#dfece3] px-6 py-5 text-[#173c32] sm:px-7">
        <Sparkles
          size={19}
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[2fr_0.95fr]">
        <article className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              NET WORTH
            </p>

            <span className="text-xl tracking-[0.18em] text-[#657972]">
              ···
            </span>
          </div>

          {summary.netWorthByCurrency.length === 0 ? (
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                <p className="font-serif text-3xl text-[#173c32]">
                  No accounts yet
                </p>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#657972]">
                  Add an account and Salif will begin calculating
                  your net worth.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="grid gap-7 sm:grid-cols-2">
                {summary.netWorthByCurrency.map((item) => (
                  <div key={item.currencyCode}>
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#657972]">
                      {item.currencyCode}
                    </p>

                    <p
                      className="mt-2 font-serif text-4xl tracking-[-0.03em] text-[#173c32] sm:text-5xl">
                      {formatMoney(
                        item.netWorth,
                        item.currencyCode,
                      )}
                    </p>

                    <p className="mt-3 text-sm text-[#657972]">
                      {item.includeAccountCount}{' '}
                      {item.includeAccountCount === 1
                        ? 'account'
                        : 'accounts'}{' '}
                      included
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 border-t border-[#e5e1d8] pt-7">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-[#657972]">
                      Total accounts
                    </p>

                    <p className="mt-2 font-serif text-3xl text-[#173c32]">
                      {summary.totalAccountCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#657972]">
                      Active
                    </p>

                    <p className="mt-2 font-serif text-3xl text-[#37745e]">
                      {summary.activeAccountCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#657972]">
                      Archived
                    </p>

                    <p className="mt-2 font-serif text-3xl text-[#8a7460]">
                      {summary.archivedAccountCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            PORTFOLIO HEALTH
          </p>

          <div className="mt-7 flex justify-center">
            <div
              className="grid size-44 place-items-center rounded-full p-3"
              style={{
                background: `conic-gradient(
                  #79a486 ${activePercentage * 3.6}deg,
                  #e4ebe3 0deg
                )`,
              }}
            >
              <div
                className="grid size-full place-items-center rounded-full border border-[#c8d8ca] bg-[#eef4ec] text-center">
                <div>
                  <p className="font-serif text-4xl text-[#2d684f]">
                    {activePercentage}%
                  </p>

                  <p className="mt-1 text-xs text-[#657972]">
                    active
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-7 text-center font-serif text-2xl text-[#173c32]">
            {activePercentage >= 75
              ? 'Looking healthy'
              : activePercentage > 0
                ? 'Taking shape'
                : 'Ready to begin'}
          </p>

          <p className="mt-3 text-center text-sm leading-6 text-[#657972]">
            {summary.activeAccountCount} of your{' '}
            {summary.totalAccountCount}{' '}
            {summary.totalAccountCount === 1
              ? 'account is'
              : 'accounts are'}{' '}
            active.
          </p>
        </article>
      </section>

      <div className="mt-12">
        <CashFlowChart />
      </div>

      <section className="mt-12">
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

        <div className="mt-6 border-y border-[#dedbd2]">
          {summary.dueRecurringTransactions.length === 0 ? (
            <div className="flex items-center gap-4 py-8">
              <span
                className="grid size-10 place-items-center rounded-full bg-[#dfece3] text-[#37745e]">
                <Check size={19} aria-hidden/>
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
            summary.dueRecurringTransactions.map((item, index) => (
              <article
                key={item.recurringTransactionId}
                className={`grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center ${
                  index > 0 ? 'border-t border-[#dedbd2]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`mt-2 size-2 shrink-0 rounded-full ${
                      item.daysOverdue > 0
                        ? 'bg-[#bb6b4d]'
                        : 'bg-[#8fb69b]'
                    }`}
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
                        : `due ${formatDate(item.nextDueDate)}`}
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
            ))
          )}
        </div>
      </section>
    </>
  )
}
