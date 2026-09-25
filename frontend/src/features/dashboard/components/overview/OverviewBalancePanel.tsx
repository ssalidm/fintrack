import {
  ArrowRight,
  Plus,
  Repeat2,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { formatMoney } from '@/utils/formatters'
import type { DashboardSummary } from '@/features/dashboard/api/types'

interface OverviewBalancePanelProps {
  readonly summary: DashboardSummary
}

export default function OverviewBalancePanel({
  summary,
}: OverviewBalancePanelProps) {
  const [
    selectedCurrency,
    setSelectedCurrency,
  ] = useState('')

  const activeItem =
    summary.netWorthByCurrency.find(
      (item) =>
        item.currencyCode ===
        selectedCurrency,
    ) ??
    summary.netWorthByCurrency[0]

  const cashFlow =
    summary.currentMonthCashFlow.find(
      (item) =>
        item.currencyCode ===
        activeItem?.currencyCode,
    )

  const monthlyNet = Number(
    cashFlow?.netCashFlow ?? 0,
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">
            Net worth
          </p>

          {activeItem ? (
            <p
              className="
                mt-3
                text-3xl
                font-bold
                tracking-[-0.035em]
                text-ink
                sm:text-4xl
              "
              title={formatMoney(
                Number(
                  activeItem.netWorth,
                ),
                activeItem.currencyCode,
              )}
            >
              {formatMoney(
                Number(
                  activeItem.netWorth,
                ),
                activeItem.currencyCode,
              )}
            </p>
          ) : (
            <p className="mt-3 text-2xl font-semibold text-ink">
              No accounts yet
            </p>
          )}
        </div>

        {summary.netWorthByCurrency
          .length > 1 &&
          activeItem && (
            <select
              value={
                activeItem.currencyCode
              }
              onChange={(event) =>
                setSelectedCurrency(
                  event.target.value,
                )
              }
              aria-label="Net worth currency"
              className="
                cursor-pointer
                rounded-lg
                border border-line
                bg-app
                py-1.5 pr-8 pl-3
                text-xs font-semibold
                text-ink
                outline-none
                transition
                focus:border-accent
              "
            >
              {summary.netWorthByCurrency.map(
                (item) => (
                  <option
                    key={
                      item.currencyCode
                    }
                    value={
                      item.currencyCode
                    }
                  >
                    {
                      item.currencyCode
                    }
                  </option>
                ),
              )}
            </select>
          )}
      </div>

      {activeItem ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={
              monthlyNet >= 0
                ? 'font-semibold text-success'
                : 'font-semibold text-danger'
            }
          >
            {monthlyNet >= 0
              ? '+'
              : ''}
            {formatMoney(
              monthlyNet,
              activeItem.currencyCode,
              0,
            )}
          </span>

          <span className="text-subtle">
            net this month
          </span>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-6 text-muted">
          Add your first account to
          start building your financial
          picture.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          to="/transfers"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-4 py-2.5
            text-sm font-semibold
            text-inverse
            transition
            hover:bg-primary-hover
          "
        >
          <Repeat2
            size={15}
            aria-hidden
          />

          Transfer
        </Link>

        <Link
          to="/transactions"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-surface-muted
            px-4 py-2.5
            text-sm font-semibold
            text-ink
            transition
            hover:bg-surface-strong
          "
        >
          <Plus
            size={15}
            aria-hidden
          />

          Transaction
        </Link>
      </div>

      <Link
        to="/accounts"
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          text-xs font-semibold
          text-accent
          transition
          hover:text-primary
        "
      >
        {summary.activeAccountCount}{' '}
        active{' '}
        {summary.activeAccountCount ===
        1
          ? 'account'
          : 'accounts'}

        <ArrowRight
          size={13}
          aria-hidden
        />
      </Link>
    </section>
  )
}
