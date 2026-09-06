import {
  ArrowDownRight,
  ArrowRight,
  CalendarClock,
  Check,
  CircleDollarSign,
  MoveRight,
  ReceiptText,
  RefreshCw,
  Repeat2,
  Sparkles,
} from 'lucide-react'
import {Link} from 'react-router'
import {ApiClientError} from '../../../api/ApiClientError'
import {useDashboardSummary} from '../../dashboard/hooks/useDashboardSummary'

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

function formatMoney(
  amount: number,
  currencyCode: string,
) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

function MoneyInMotionSkeleton() {
  return (
    <div className="mt-9 animate-pulse space-y-8">
      <div className="h-80 rounded-3xl bg-[#e5e8e1]"/>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="h-52 rounded-3xl bg-[#e5e8e1]"/>
        <div className="h-52 rounded-3xl bg-[#e5e8e1]"/>
        <div className="h-52 rounded-3xl bg-[#e5e8e1]"/>
      </div>

      <div className="h-64 rounded-3xl bg-[#e5e8e1]"/>
    </div>
  )
}

export default function MoneyInMotionPage() {
  const {
    data: summary,
    error,
    isPending,
    isFetching,
    refetch,
  } = useDashboardSummary()

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : 'Unable to load your money movement overview.'

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
              YOUR FINANCIAL RHYTHM
            </p>

            <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-[#173c32] sm:text-5xl">
              Money in motion
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657972]">
              One place for recording, moving, and planning
              everything your money does.
            </p>
          </div>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#dedbd2] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#173c32] transition hover:border-[#8da397] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isFetching ? 'animate-spin' : ''}
              aria-hidden
            />

            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </header>

        {isPending && <MoneyInMotionSkeleton/>}

        {error && (
          <section
            role="alert"
            className="mt-9 rounded-2xl border border-red-200 bg-red-50 p-7"
          >
            <h2 className="font-serif text-2xl text-red-950">
              We couldn’t load this page
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </section>
        )}

        {summary && (
          <>
            <section className="relative mt-9 overflow-hidden rounded-3xl border border-[#ded8ca] bg-[radial-gradient(circle_at_top_right,_rgba(197,219,203,0.7),_transparent_42%),linear-gradient(135deg,_#fffdf8_0%,_#f3eee2_100%)]">
              <div
                className="absolute -top-16 -right-16 size-56 rounded-full border border-[#afcdb7]/40"
                aria-hidden
              />

              <div
                className="absolute top-4 right-5 size-32 rounded-full border border-[#bd9460]/20"
                aria-hidden
              />

              <div className="relative grid gap-10 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12 lg:py-12">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#d5c9b7] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#775d3d]">
                    <Sparkles size={13} aria-hidden/>
                    A place for every movement
                  </span>

                  <h2 className="mt-6 max-w-xl font-serif text-4xl leading-[1.08] tracking-[-0.035em] text-[#173c32] sm:text-5xl">
                    Choose what you want your money to do next.
                  </h2>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-[#5e716a]">
                    Capture everyday activity, transfer funds
                    between your accounts, or prepare the payments
                    and income that repeat over time.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/transactions"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216353]"
                    >
                      Record a transaction
                      <ArrowRight size={15} aria-hidden/>
                    </Link>

                    <Link
                      to="/transfers"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#cfc4b4] bg-white/65 px-5 py-3 text-sm font-semibold text-[#173c32] transition hover:border-[#9a8060] hover:bg-white"
                    >
                      Make a transfer
                    </Link>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-md">
                  <div className="relative rounded-3xl border border-white/80 bg-white/55 p-5 shadow-[0_20px_55px_rgba(50,67,59,0.08)] backdrop-blur-sm">
                    <div className="flex items-center gap-4 rounded-2xl border border-[#dce6df] bg-[#f5faf6] px-5 py-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dcebe1] text-[#2d684f]">
                        <ReceiptText size={18} aria-hidden/>
                      </span>

                      <div>
                        <p className="text-xs font-semibold tracking-[0.12em] text-[#5d766c]">
                          CAPTURE
                        </p>

                        <p className="mt-1 font-serif text-lg text-[#173c32]">
                          Income and expenses
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center py-2 text-[#bd8539]">
                      <ArrowDownRight
                        size={20}
                        aria-hidden
                      />
                    </div>

                    <div className="ml-5 flex items-center gap-4 rounded-2xl border border-[#eadcc2] bg-[#fff8ea] px-5 py-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f1e1c4] text-[#9a6828]">
                        <Repeat2 size={18} aria-hidden/>
                      </span>

                      <div>
                        <p className="text-xs font-semibold tracking-[0.12em] text-[#8d6c40]">
                          MOVE
                        </p>

                        <p className="mt-1 font-serif text-lg text-[#173c32]">
                          Between your accounts
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center py-2 text-[#708e9d]">
                      <ArrowDownRight
                        size={20}
                        aria-hidden
                      />
                    </div>

                    <div className="ml-10 flex items-center gap-4 rounded-2xl border border-[#d8e1e5] bg-[#f3f7f8] px-5 py-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dfe9ed] text-[#557587]">
                        <CalendarClock
                          size={18}
                          aria-hidden
                        />
                      </span>

                      <div>
                        <p className="text-xs font-semibold tracking-[0.12em] text-[#657f8d]">
                          PLAN
                        </p>

                        <p className="mt-1 font-serif text-lg text-[#173c32]">
                          Repeating activity
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-11">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
                  CHOOSE A PATH
                </p>

                <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
                  What would you like to manage?
                </h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <Link
                  to="/transactions"
                  className="group cursor-pointer rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 transition hover:-translate-y-1 hover:border-[#9eb5aa] hover:shadow-[0_16px_35px_rgba(23,79,67,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#e0ece4] text-[#2d684f]">
                      <ReceiptText size={20} aria-hidden/>
                    </span>

                    <MoveRight
                      size={18}
                      className="text-[#bd8539] transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-6 font-serif text-2xl text-[#173c32]">
                    Transactions
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#657972]">
                    Track income and expenses and understand where
                    your money is going.
                  </p>
                </Link>

                <Link
                  to="/transfers"
                  className="group cursor-pointer rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 transition hover:-translate-y-1 hover:border-[#c7aa7b] hover:shadow-[0_16px_35px_rgba(154,104,40,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#f1e7d3] text-[#9a6828]">
                      <Repeat2 size={20} aria-hidden/>
                    </span>

                    <MoveRight
                      size={18}
                      className="text-[#bd8539] transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-6 font-serif text-2xl text-[#173c32]">
                    Transfers
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#657972]">
                    Move funds between accounts without counting
                    the movement as income or spending.
                  </p>
                </Link>

                <Link
                  to="/recurring"
                  className="group cursor-pointer rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 transition hover:-translate-y-1 hover:border-[#a9bdc7] hover:shadow-[0_16px_35px_rgba(85,117,135,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#e3e9ed] text-[#557587]">
                      <CalendarClock size={20} aria-hidden/>
                    </span>

                    <MoveRight
                      size={18}
                      className="text-[#bd8539] transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <h3 className="font-serif text-2xl text-[#173c32]">
                      Recurring
                    </h3>

                    {summary.dueRecurringTransactionCount >
                      0 && (
                      <span className="rounded-full bg-[#f5e4dc] px-2.5 py-1 text-xs font-bold text-[#a85e49]">
                        {
                          summary.dueRecurringTransactionCount
                        }{' '}
                        due
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#657972]">
                    Prepare repeating payments and income before
                    their next scheduled date.
                  </p>
                </Link>
              </div>
            </section>

            <section className="mt-11 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
              <article className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
                      COMING UP
                    </p>

                    <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
                      Payments to watch
                    </h2>
                  </div>

                  <Link
                    to="/recurring"
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#9a6828] hover:underline hover:underline-offset-4"
                  >
                    View schedules
                    <ArrowRight size={15} aria-hidden/>
                  </Link>
                </div>

                <div className="mt-6 border-y border-[#e5e1d8]">
                  {summary.dueRecurringTransactions.length ===
                  0 ? (
                    <div className="flex items-center gap-4 py-8">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#dfece3] text-[#37745e]">
                        <Check size={19} aria-hidden/>
                      </span>

                      <div>
                        <p className="font-semibold text-[#173c32]">
                          Nothing needs your attention
                        </p>

                        <p className="mt-1 text-sm text-[#657972]">
                          Your recurring activity is currently up
                          to date.
                        </p>
                      </div>
                    </div>
                  ) : (
                    summary.dueRecurringTransactions
                      .slice(0, 4)
                      .map((item, index) => (
                        <article
                          key={item.recurringTransactionId}
                          className={`grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center ${
                            index > 0
                              ? 'border-t border-[#e5e1d8]'
                              : ''
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
                                {item.categoryName ??
                                  'Uncategorised'}
                                {' · '}
                                {item.accountName}
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <p className="font-semibold text-[#173c32]">
                              {formatMoney(
                                item.amount,
                                item.currencyCode,
                              )}
                            </p>

                            <p
                              className={`mt-1 text-xs ${
                                item.daysOverdue > 0
                                  ? 'font-semibold text-[#a85e49]'
                                  : 'text-[#657972]'
                              }`}
                            >
                              {item.daysOverdue > 0
                                ? `${item.daysOverdue} ${
                                  item.daysOverdue === 1
                                    ? 'day'
                                    : 'days'
                                } overdue`
                                : `Due ${formatDate(
                                  item.nextDueDate,
                                )}`}
                            </p>
                          </div>
                        </article>
                      ))
                  )}
                </div>
              </article>

              <aside className="rounded-3xl border border-[#dedbd2] bg-[#f0f3ed] p-6 sm:p-8">
                <span className="grid size-11 place-items-center rounded-full bg-[#dce9e0] text-[#2d684f]">
                  <CircleDollarSign size={20} aria-hidden/>
                </span>

                <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-[#657972]">
                  A SIMPLE DISTINCTION
                </p>

                <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
                  Movement is not always spending.
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#5e716a]">
                  Transactions change what you earned or spent.
                  Transfers only change where your money is held.
                  Recurring schedules prepare future transactions.
                </p>

                <div className="mt-7 border-t border-[#d5ddd5] pt-6">
                  <p className="text-sm font-semibold text-[#173c32]">
                    Salif keeps each type separate
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#657972]">
                    This keeps account balances and financial
                    reports accurate.
                  </p>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  )
}