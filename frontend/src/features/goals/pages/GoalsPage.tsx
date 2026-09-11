import {
  useMemo,
  useState,
} from 'react'
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  History,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'

import { ApiClientError } from '../../../api/ApiClientError'

import type {
  SavingsGoal,
  SavingsGoalStatus,
} from '../api/types'
import ContributionModal from '../components/ContributionModal'
import GoalActionDialog, {
  type GoalAction,
} from '../components/GoalActionDialog'
import GoalModal from '../components/GoalModal'
import {
  useArchiveGoal,
  useCompleteGoal,
  useGoals,
} from '../hooks/useGoals'
import ContributionHistoryDrawer from '../components/ContributionHistoryDrawer'
import PageShell from '../../../components/layout/PageShell'

const statusOptions = [
  {
    value: 'ACTIVE',
    label: 'In progress',
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
  },
] satisfies Array<{
  value: SavingsGoalStatus
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

function formatTargetDate(value: string) {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(parseLocalDate(value))
}

function daysUntil(value: string) {
  const target = parseLocalDate(value)
  const now = new Date()

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  return Math.ceil(
    (
      target.getTime() -
      today.getTime()
    ) / 86_400_000,
  )
}

function deadlineCopy(
  targetDate: string | null,
) {
  if (!targetDate) {
    return 'No fixed deadline'
  }

  const remaining = daysUntil(targetDate)

  if (remaining < 0) {
    return `${Math.abs(
      remaining,
    )} days past target`
  }

  if (remaining === 0) {
    return 'Target is today'
  }

  return `${remaining} days remaining`
}

interface ActionTarget {
  goal: SavingsGoal
  action: GoalAction
}

export default function GoalsPage() {
  const [status, setStatus] =
    useState<SavingsGoalStatus>('ACTIVE')

  const [
    isGoalModalOpen,
    setIsGoalModalOpen,
  ] = useState(false)

  const [
    editingGoal,
    setEditingGoal,
  ] = useState<SavingsGoal | null>(null)

  const [
    contributionGoal,
    setContributionGoal,
  ] = useState<SavingsGoal | null>(null)

  const [
    actionTarget,
    setActionTarget,
  ] = useState<ActionTarget | null>(null)

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(null)

  const [
    historyGoalId,
    setHistoryGoalId,
  ] = useState<string | null>(null)

  const goalsQuery = useGoals(status)
  const completeGoal = useCompleteGoal()
  const archiveGoal = useArchiveGoal()

  const goals = useMemo(
    () => goalsQuery.data ?? [],
    [goalsQuery.data],
  )

  const historyGoal = useMemo(
    () =>
      goals.find(
        (goal) =>
          goal.id === historyGoalId,
      ) ?? null,
    [goals, historyGoalId],
  )

  const averageProgress = useMemo(() => {
    if (goals.length === 0) {
      return 0
    }



    const totalProgress = goals.reduce(
      (total, goal) =>
        total +
        Math.min(
          goal.progressPercentage,
          100,
        ),
      0,
    )

    return Math.round(
      totalProgress / goals.length,
    )
  }, [goals])

  const momentumMessage = useMemo(() => {
    if (status === 'COMPLETED') {
      if (goals.length === 0) {
        return 'Finished goals will become milestones here.'
      }

      if (goals.length === 1) {
        return 'One promise to yourself, kept.'
      }

      return 'A growing record of promises kept.'
    }

    if (status === 'ARCHIVED') {
      return goals.length === 0
        ? 'Nothing tucked away yet.'
        : 'Past plans, kept for perspective.'
    }

    if (goals.length === 0) {
      return 'A fresh page for your next plan.'
    }

    if (averageProgress >= 100) {
      return 'A target has been reached—time to celebrate it.'
    }

    if (averageProgress >= 75) {
      return 'The finish line is getting close.'
    }

    if (averageProgress >= 35) {
      return 'Small steps are building something real.'
    }

    return 'Every strong goal starts with one step.'
  }, [
    averageProgress,
    goals.length,
    status,
  ])

  const nearestGoal = useMemo(() => {
    return goals
      .filter(
        (goal) =>
          goal.targetDate !== null,
      )
      .toSorted(
        (left, right) =>
          left.targetDate!.localeCompare(
            right.targetDate!,
          ),
      )[0]
  }, [goals])

  function openCreateGoal() {
    setEditingGoal(null)
    setIsGoalModalOpen(true)
  }

  function openEditGoal(
    goal: SavingsGoal,
  ) {
    setEditingGoal(goal)
    setIsGoalModalOpen(true)
  }

  function closeGoalModal() {
    setIsGoalModalOpen(false)
    setEditingGoal(null)
  }

  function requestAction(
    goal: SavingsGoal,
    action: GoalAction,
  ) {
    setActionError(null)

    setActionTarget({
      goal,
      action,
    })
  }

  async function confirmAction() {
    if (!actionTarget) {
      return
    }

    setActionError(null)

    try {
      if (
        actionTarget.action ===
        'complete'
      ) {
        await completeGoal.mutateAsync({
          goalId: actionTarget.goal.id,

          payload: {
            version:
              actionTarget.goal.version,
          },
        })
      } else {
        await archiveGoal.mutateAsync({
          goalId: actionTarget.goal.id,

          payload: {
            version:
              actionTarget.goal.version,
          },
        })
      }

      setActionTarget(null)
    } catch (error) {
      setActionError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to update this goal.',
      )
    }
  }

  const actionPending =
    completeGoal.isPending ||
    archiveGoal.isPending

  return (
    <PageShell>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
            ROOM FOR WHAT MATTERS
          </p>

          <h1 className="mt-4 font-serif text-5xl tracking-[-0.03em] text-[#173c32]">
            Your goals
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#657972]">
            Turn the things you care about
            into steady, visible progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              void goalsQuery.refetch()
            }
            disabled={
              goalsQuery.isFetching
            }
            className="cursor-pointer rounded-full border border-[#d8d6ce] bg-[#fffdf8] p-3 text-[#657972] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh goals"
            title="Refresh goals"
          >
            <RefreshCw
              size={18}
              aria-hidden
              className={
                goalsQuery.isFetching
                  ? 'animate-spin'
                  : ''
              }
            />
          </button>

          <button
            type="button"
            onClick={openCreateGoal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236a58]"
          >
            <Plus
              size={18}
              aria-hidden
            />

            New goal
          </button>
        </div>
      </header>

      <section className="mt-9 grid overflow-hidden rounded-3xl border border-[#d8ded8] bg-[#eaf0e9] md:grid-cols-[1.35fr_0.8fr_0.9fr]">
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#cfe1d5] text-[#39725d]">
              <Sparkles
                size={20}
                aria-hidden
              />
            </span>

            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[#657972]">
                YOUR MOMENTUM
              </p>

              <p className="mt-2 font-serif text-2xl text-[#173c32]">
                {momentumMessage}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#d4ddd5] p-6 sm:p-7 md:border-l md:border-t-0">
          <p className="text-xs font-semibold tracking-[0.13em] text-[#657972]">
            AVERAGE PROGRESS
          </p>

          <div className="mt-3 flex items-end gap-3">
            <p className="font-serif text-4xl text-[#173c32]">
              {averageProgress}%
            </p>

            <TrendingUp
              size={19}
              aria-hidden
              className="mb-1.5 text-[#56836f]"
            />
          </div>
        </div>

        <div className="border-t border-[#d4ddd5] p-6 sm:p-7 md:border-l md:border-t-0">
          <p className="text-xs font-semibold tracking-[0.13em] text-[#657972]">
            NEAREST TARGET
          </p>

          <p className="mt-3 truncate font-semibold text-[#173c32]">
            {nearestGoal?.name ??
              'No date set'}
          </p>

          <p className="mt-1 text-xs text-[#657972]">
            {nearestGoal
              ? deadlineCopy(
                nearestGoal.targetDate,
              )
              : 'Choose dates only when they help.'}
          </p>
        </div>
      </section>

      <div className="mt-9 flex gap-7 border-b border-[#dedbd2]">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              setStatus(option.value)
            }
            className={`cursor-pointer border-b-2 px-1 pb-4 text-sm font-semibold transition ${status === option.value
              ? 'border-[#39725d] text-[#173c32]'
              : 'border-transparent text-[#7a8984] hover:text-[#173c32]'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {goalsQuery.isPending && (
        <div className="mt-8 grid animate-pulse gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-72 rounded-3xl bg-[#e5e8e1]"
              />
            ),
          )}
        </div>
      )}

      {goalsQuery.error && (
        <section
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <h2 className="font-serif text-2xl text-red-950">
            We couldn’t load your goals
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {goalsQuery.error instanceof
              ApiClientError
              ? goalsQuery.error.message
              : 'Please try again.'}
          </p>

          <button
            type="button"
            onClick={() =>
              void goalsQuery.refetch()
            }
            className="mt-4 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
          >
            Try again
          </button>
        </section>
      )}

      {!goalsQuery.isPending &&
        !goalsQuery.error &&
        goals.length === 0 && (
          <section className="mt-8 rounded-3xl border border-[#dedbd2] bg-[#fffdf8] px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f2e7ca] text-[#9a6828]">
              <Target
                size={25}
                aria-hidden
              />
            </span>

            <h2 className="mt-5 font-serif text-3xl text-[#173c32]">
              {status === 'ACTIVE'
                ? 'What are you making room for?'
                : status ===
                  'COMPLETED'
                  ? 'No completed goals yet'
                  : 'No archived goals'}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#657972]">
              {status === 'ACTIVE'
                ? 'Start with something meaningful. The amount can be practical; the reason should feel personal.'
                : 'Goals in this stage will stay here with their history intact.'}
            </p>

            {status === 'ACTIVE' && (
              <button
                type="button"
                onClick={
                  openCreateGoal
                }
                className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236a58]"
              >
                <Plus
                  size={18}
                  aria-hidden
                />

                Create your first goal
              </button>
            )}
          </section>
        )}

      {!goalsQuery.isPending &&
        !goalsQuery.error &&
        goals.length > 0 && (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {goals.map((goal) => {
              const displayedProgress =
                Math.min(
                  goal.progressPercentage,
                  100,
                )

              const targetReached =
                goal.currentAmount >=
                goal.targetAmount

              return (
                <article
                  key={goal.id}
                  className="flex min-h-72 flex-col rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-7"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e3eee7] text-[#39725d]">
                      {goal.status ===
                        'COMPLETED' ? (
                        <CheckCircle2
                          size={21}
                          aria-hidden
                        />
                      ) : (
                        <Target
                          size={21}
                          aria-hidden
                        />
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setHistoryGoalId(goal.id)
                        }
                        className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#edf2ee] hover:text-[#39725d]"
                        aria-label={`View contribution history for ${goal.name}`}
                        title="Contribution history"
                      >
                        <History
                          size={17}
                          aria-hidden
                        />
                      </button>

                      {goal.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() =>
                            openEditGoal(goal)
                          }
                          className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#edf2ee] hover:text-[#39725d]"
                          aria-label={`Edit ${goal.name}`}
                          title="Edit goal"
                        >
                          <Pencil
                            size={17}
                            aria-hidden
                          />
                        </button>
                      )}

                      {goal.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() =>
                            requestAction(
                              goal,
                              'archive',
                            )
                          }
                          className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#f2e7df] hover:text-[#9b5845]"
                          aria-label={`Archive ${goal.name}`}
                          title="Archive goal"
                        >
                          <Archive
                            size={17}
                            aria-hidden
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="mt-5 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
                    {goal.name}
                  </h2>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#657972]">
                    {goal.description ??
                      'A clear destination for steady progress.'}
                  </p>

                  <div className="mt-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
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

                      <p className="font-serif text-2xl text-[#39725d]">
                        {Math.round(
                          goal.progressPercentage,
                        )}
                        %
                      </p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e2e4dc]">
                      <div
                        className="h-full rounded-full bg-[#6f9b82] transition-[width] duration-500"
                        style={{
                          width: `${displayedProgress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[#657972]">
                      <span>
                        {formatMoney(
                          goal.remainingAmount,
                          goal.currencyCode,
                        )}{' '}
                        to go
                      </span>

                      <span>
                        Target{' '}
                        {formatMoney(
                          goal.targetAmount,
                          goal.currencyCode,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs text-[#657972]">
                    <CalendarDays
                      size={15}
                      aria-hidden
                    />

                    {goal.targetDate
                      ? `${formatTargetDate(
                        goal.targetDate,
                      )} · ${deadlineCopy(
                        goal.targetDate,
                      )}`
                      : 'No fixed deadline'}
                  </div>

                  {goal.status ===
                    'ACTIVE' && (
                      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-[#e5e1d8] pt-5">
                        <button
                          type="button"
                          onClick={() =>
                            setContributionGoal(
                              goal,
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a58]"
                        >
                          <CircleDollarSign
                            size={17}
                            aria-hidden
                          />

                          Add contribution
                        </button>

                        {targetReached && (
                          <button
                            type="button"
                            onClick={() =>
                              requestAction(
                                goal,
                                'complete',
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-[#39725d] transition hover:bg-[#edf2ee]"
                          >
                            <CheckCircle2
                              size={17}
                              aria-hidden
                            />

                            Mark complete
                          </button>
                        )}
                      </div>
                    )}
                </article>
              )
            })}
          </section>
        )}


      {historyGoal && (
        <ContributionHistoryDrawer
          goal={historyGoal}
          onClose={() =>
            setHistoryGoalId(null)
          }
        />
      )}

      {isGoalModalOpen && (
        <GoalModal
          goal={editingGoal ?? undefined}
          onClose={closeGoalModal}
        />
      )}

      {contributionGoal && (
        <ContributionModal
          goal={contributionGoal}
          onClose={() =>
            setContributionGoal(null)
          }
        />
      )}

      {actionTarget && (
        <GoalActionDialog
          goal={actionTarget.goal}
          action={actionTarget.action}
          isPending={actionPending}
          error={actionError}
          onCancel={() =>
            setActionTarget(null)
          }
          onConfirm={() =>
            void confirmAction()
          }
        />
      )}
    </PageShell>
  )
}