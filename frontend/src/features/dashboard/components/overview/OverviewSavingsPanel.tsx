import {
  ArrowRight,
  PiggyBank,
  Target,
} from 'lucide-react'
import { Link } from 'react-router'

import { formatMoney } from '../../../../utils/formatters'
import { useGoals } from '../../../goals/hooks/useGoals'

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100)
}

export default function OverviewSavingsPanel() {
  const goalsQuery = useGoals('ACTIVE')
  const goals = (goalsQuery.data ?? []).slice(0, 3)

  return (
    <section className="flex h-full flex-col rounded-2xl border border-line/50 bg-surface p-5 shadow-[0_10px_30px_rgba(23,60,50,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
            <PiggyBank size={16} aria-hidden />
          </span>

          <div>
            <h2 className="text-base font-semibold text-ink">
              Savings goals
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Progress towards what matters
            </p>
          </div>
        </div>

        <Link
          to="/goals"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-accent transition hover:text-primary"
        >
          View all
          <ArrowRight size={13} aria-hidden />
        </Link>
      </div>

      {goalsQuery.isPending && (
        <div className="mt-5 space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-surface-muted"
            />
          ))}
        </div>
      )}

      {goalsQuery.isError && (
        <div className="mt-6" role="alert">
          <p className="text-sm text-danger">
            Savings goals could not be loaded.
          </p>

          <button
            type="button"
            onClick={() => void goalsQuery.refetch()}
            className="mt-2 cursor-pointer text-xs font-semibold text-accent underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {goalsQuery.isSuccess && goals.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <Target size={19} aria-hidden />
          </span>

          <p className="mt-4 text-sm font-semibold text-ink">
            No active goals yet
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-muted">
            Create a savings goal and its progress will appear here.
          </p>

          <Link
            to="/goals"
            className="mt-4 text-xs font-semibold text-accent transition hover:text-primary"
          >
            Create a goal
          </Link>
        </div>
      )}

      {goals.length > 0 && (
        <div className="mt-5 flex-1 divide-y divide-line/50">
          {goals.map((goal) => {
            const progress = clampPercentage(goal.progressPercentage)

            return (
              <div key={goal.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {goal.name}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {formatMoney(goal.currentAmount, goal.currencyCode)} of{' '}
                      {formatMoney(goal.targetAmount, goal.currencyCode)}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-success">
                    {Math.round(goal.progressPercentage)}%
                  </span>
                </div>

                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong"
                  role="progressbar"
                  aria-label={`${goal.name} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {goalsQuery.isSuccess && (goalsQuery.data?.length ?? 0) > 3 && (
        <p className="mt-4 text-xs text-subtle">
          Plus {(goalsQuery.data?.length ?? 0) - 3} more active{' '}
          {(goalsQuery.data?.length ?? 0) - 3 === 1 ? 'goal' : 'goals'}.
        </p>
      )}
    </section>
  )
}
