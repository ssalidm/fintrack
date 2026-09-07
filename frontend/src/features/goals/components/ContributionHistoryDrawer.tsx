import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  Pencil,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

import {ApiClientError} from '../../../api/ApiClientError'

import type {
  GoalContribution,
  GoalContributionStatus,
  SavingsGoal,
} from '../api/types'
import {useGoalContributions} from '../hooks/useGoals'
import EditContributionModal from './EditContributionModal'
import VoidContributionModal from './VoidContributionModal'

interface ContributionHistoryDrawerProps {
  goal: SavingsGoal
  onClose: () => void
}

const statusOptions = [
  {
    value: 'POSTED',
    label: 'Counted',
  },
  {
    value: 'VOIDED',
    label: 'Voided',
  },
] satisfies Array<{
  value: GoalContributionStatus
  label: string
}>

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

function parseLocalDate(value: string) {
  const [year, month, day] = value
    .split('-')
    .map(Number)

  return new Date(
    year,
    month - 1,
    day,
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(parseLocalDate(value))
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(new Date(value))
}

export default function ContributionHistoryDrawer({
  goal,
  onClose,
}: ContributionHistoryDrawerProps) {
  const [status, setStatus] =
    useState<GoalContributionStatus>(
      'POSTED',
    )

  const [page, setPage] = useState(0)

  const [
    editingContribution,
    setEditingContribution,
  ] = useState<GoalContribution | null>(
    null,
  )

  const [
    voidingContribution,
    setVoidingContribution,
  ] = useState<GoalContribution | null>(
    null,
  )

  const contributionsQuery =
    useGoalContributions(
      goal.id,
      status,
      page,
    )

  const contributions =
    contributionsQuery.data?.items ?? []

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape' &&
        !editingContribution &&
        !voidingContribution
      ) {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [
    editingContribution,
    voidingContribution,
    onClose,
  ])

  function changeStatus(
    nextStatus: GoalContributionStatus,
  ) {
    setStatus(nextStatus)
    setPage(0)
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-[#102e27]/45 backdrop-blur-[2px]"
        aria-label="Close contribution history"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contribution-history-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-[#f7f5ef] shadow-2xl"
      >
        <header className="border-b border-[#dedbd2] px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
                EVERY STEP COUNTS
              </p>

              <h2
                id="contribution-history-title"
                className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#173c32]"
              >
                Contribution history
              </h2>

              <p className="mt-2 text-sm text-[#657972]">
                {goal.name}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#ebe9e3] hover:text-[#173c32]"
              aria-label="Close"
            >
              <X size={20}/>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d8ded8] bg-[#eaf0e9]">
            <div className="p-4">
              <p className="text-xs text-[#657972]">
                Saved so far
              </p>

              <p className="mt-1 font-serif text-2xl text-[#173c32]">
                {formatMoney(
                  goal.currentAmount,
                  goal.currencyCode,
                )}
              </p>
            </div>

            <div className="border-l border-[#d4ddd5] p-4">
              <p className="text-xs text-[#657972]">
                Goal progress
              </p>

              <p className="mt-1 font-serif text-2xl text-[#39725d]">
                {Math.round(
                  goal.progressPercentage,
                )}
                %
              </p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-[#dedbd2] px-6 sm:px-8">
          <div className="flex gap-6">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  changeStatus(option.value)
                }
                className={`cursor-pointer border-b-2 py-4 text-sm font-semibold transition ${
                  status === option.value
                    ? 'border-[#39725d] text-[#173c32]'
                    : 'border-transparent text-[#7a8984] hover:text-[#173c32]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              void contributionsQuery.refetch()
            }
            disabled={
              contributionsQuery.isFetching
            }
            className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#e7ece7] hover:text-[#39725d] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh contributions"
          >
            <RefreshCw
              size={17}
              aria-hidden
              className={
                contributionsQuery.isFetching
                  ? 'animate-spin'
                  : ''
              }
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {contributionsQuery.isPending && (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-24 rounded-2xl bg-[#e5e8e1]"
                  />
                ),
              )}
            </div>
          )}

          {contributionsQuery.error && (
            <section
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5"
            >
              <h3 className="font-serif text-2xl text-red-950">
                We couldn’t load the history
              </h3>

              <p className="mt-2 text-sm text-red-700">
                {contributionsQuery.error instanceof
                ApiClientError
                  ? contributionsQuery.error
                      .message
                  : 'Please try again.'}
              </p>

              <button
                type="button"
                onClick={() =>
                  void contributionsQuery.refetch()
                }
                className="mt-4 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
              >
                Try again
              </button>
            </section>
          )}

          {!contributionsQuery.isPending &&
            !contributionsQuery.error &&
            contributions.length === 0 && (
              <section className="py-14 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e3eee7] text-[#39725d]">
                  <CalendarDays
                    size={21}
                    aria-hidden
                  />
                </span>

                <h3 className="mt-4 font-serif text-2xl text-[#173c32]">
                  {status === 'POSTED'
                    ? 'No contributions yet'
                    : 'Nothing has been voided'}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#657972]">
                  {status === 'POSTED'
                    ? 'Your progress entries will appear here as you add to this goal.'
                    : 'Contributions removed from the total will remain visible here.'}
                </p>
              </section>
            )}

          {!contributionsQuery.isPending &&
            !contributionsQuery.error &&
            contributions.length > 0 && (
              <div className="space-y-3">
                {contributions.map(
                  (contribution) => (
                    <article
                      key={contribution.id}
                      className={`rounded-2xl border p-5 ${
                        contribution.status ===
                        'VOIDED'
                          ? 'border-[#ead8d1] bg-[#fbf4f1]'
                          : 'border-[#dedbd2] bg-[#fffdf8]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <p
                            className={`font-serif text-2xl ${
                              contribution.status ===
                              'VOIDED'
                                ? 'text-[#8a675d] line-through'
                                : 'text-[#173c32]'
                            }`}
                          >
                            {formatMoney(
                              contribution.amount,
                              goal.currencyCode,
                            )}
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-xs text-[#657972]">
                            <CalendarDays
                              size={14}
                              aria-hidden
                            />

                            {formatDate(
                              contribution.contributionDate,
                            )}
                          </p>
                        </div>

                        {contribution.status ===
                          'POSTED' && (
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingContribution(
                                  contribution,
                                )
                              }
                              className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#e6efe9] hover:text-[#39725d]"
                              aria-label="Edit contribution"
                            >
                              <Pencil
                                size={17}
                                aria-hidden
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setVoidingContribution(
                                  contribution,
                                )
                              }
                              className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#f2e7df] hover:text-[#9b5845]"
                              aria-label="Void contribution"
                            >
                              <Ban
                                size={17}
                                aria-hidden
                              />
                            </button>
                          </div>
                        )}
                      </div>

                      {contribution.note && (
                        <p className="mt-4 text-sm leading-6 text-[#526b63]">
                          {contribution.note}
                        </p>
                      )}

                      {contribution.status ===
                        'VOIDED' && (
                        <div className="mt-4 border-t border-[#ead8d1] pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9b5845]">
                            Voided
                          </p>

                          <p className="mt-2 text-sm text-[#76574f]">
                            {contribution.voidReason}
                          </p>

                          {contribution.voidedAt && (
                            <p className="mt-2 text-xs text-[#8a746d]">
                              {formatTimestamp(
                                contribution.voidedAt,
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  ),
                )}
              </div>
            )}
        </div>

        {contributionsQuery.data &&
          contributionsQuery.data.totalPages >
            1 && (
            <footer className="flex items-center justify-between border-t border-[#dedbd2] bg-[#fffdf8] px-6 py-4 sm:px-8">
              <p className="text-xs text-[#657972]">
                Page {page + 1} of{' '}
                {
                  contributionsQuery.data
                    .totalPages
                }
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage(
                      (current) =>
                        current - 1,
                    )
                  }
                  disabled={
                    contributionsQuery.data
                      .first
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d6ce] px-4 py-2 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft
                    size={16}
                    aria-hidden
                  />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  disabled={
                    contributionsQuery.data
                      .last
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d6ce] px-4 py-2 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight
                    size={16}
                    aria-hidden
                  />
                </button>
              </div>
            </footer>
          )}
      </section>

      {editingContribution && (
        <EditContributionModal
          goal={goal}
          contribution={
            editingContribution
          }
          onClose={() =>
            setEditingContribution(null)
          }
        />
      )}

      {voidingContribution && (
        <VoidContributionModal
          goal={goal}
          contribution={
            voidingContribution
          }
          onClose={() =>
            setVoidingContribution(null)
          }
        />
      )}
    </div>
  )
}