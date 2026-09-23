import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { formatMoney } from '../../../utils/formatters'
import type { MonthlyCashFlow } from '../api/types'

interface MonthlyCashFlowCardProps {
  readonly items: MonthlyCashFlow[]
}

export default function MonthlyCashFlowCard({
  items,
}: MonthlyCashFlowCardProps) {
  const [
    selectedCurrency,
    setSelectedCurrency,
  ] = useState('')

  const activeItem =
    items.find(
      (item) =>
        item.currencyCode ===
        selectedCurrency,
    ) ?? items[0]

  const netCashFlow = Number(
    activeItem?.netCashFlow ?? 0,
  )

  const isPositive =
    netCashFlow >= 0

  return (
    <article
      className="
        flex min-h-[250px]
        flex-col
        border-y border-line/60
        py-6
      "
    >
      <header
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="flex items-center gap-3">
          <span
            className="
              grid size-9
              shrink-0
              place-items-center
              rounded-lg
              bg-warning-soft
              text-warning
            "
          >
            <CalendarDays
              size={17}
              aria-hidden
            />
          </span>

          <div>
            <p className="type-eyebrow">
              THIS MONTH
            </p>

            <p className="mt-1 text-xs text-muted">
              Money in and money out
            </p>
          </div>
        </div>

        {items.length > 1 &&
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
              aria-label="Cash flow currency"
              className="
                cursor-pointer
                rounded-md
                border border-line-strong
                bg-surface
                py-1.5 pr-8 pl-3
                text-xs font-semibold
                text-ink
                outline-none
                transition
                focus:border-accent
              "
            >
              {items.map((item) => (
                <option
                  key={
                    item.currencyCode
                  }
                  value={
                    item.currencyCode
                  }
                >
                  {item.currencyCode}
                </option>
              ))}
            </select>
          )}
      </header>

      {!activeItem ? (
        <div
          className="
            mt-8
            flex flex-1
            flex-col
            justify-between
          "
        >
          <div>
            <p className="type-card-title">
              No movement yet
            </p>

            <p className="mt-2 type-body">
              Your first posted transaction
              will bring this view to life.
            </p>
          </div>

          <Link
            to="/transactions"
            className="
              mt-6
              inline-flex
              w-fit
              cursor-pointer
              items-center
              gap-2
              text-sm font-semibold
              text-accent
              transition
              hover:text-primary
            "
          >
            Add a transaction

            <ArrowRight
              size={15}
              aria-hidden
            />
          </Link>
        </div>
      ) : (
        <div
          className="
            mt-7
            flex flex-1
            flex-col
          "
        >
          <div>
            <p className="text-xs font-medium text-muted">
              Net cash flow
            </p>

            <div
              className="
                mt-1
                flex flex-wrap
                items-end
                justify-between
                gap-3
              "
            >
              <p
                className={`
                  truncate
                  text-3xl
                  font-bold
                  tracking-[-0.035em]
                  sm:text-4xl
                  ${
                    isPositive
                      ? 'text-success'
                      : 'text-danger'
                  }
                `}
                title={formatMoney(
                  netCashFlow,
                  activeItem.currencyCode,
                )}
              >
                {isPositive
                  ? '+'
                  : ''}
                {formatMoney(
                  netCashFlow,
                  activeItem.currencyCode,
                )}
              </p>

              <p
                className={`
                  text-xs
                  font-semibold
                  ${
                    isPositive
                      ? 'text-success'
                      : 'text-danger'
                  }
                `}
              >
                {isPositive
                  ? 'Keeping more'
                  : 'Spending more'}
              </p>
            </div>
          </div>

          <div
            className="
              mt-auto
              grid
              gap-4
              border-t border-line/60
              pt-5
              sm:grid-cols-[1fr_1fr_auto]
              sm:items-end
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-semibold
                  tracking-[0.1em]
                  text-success
                "
              >
                <ArrowDownLeft
                  size={13}
                  aria-hidden
                />

                INCOME
              </div>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  font-semibold
                  text-ink
                "
                title={formatMoney(
                  Number(
                    activeItem.totalIncome,
                  ),
                  activeItem.currencyCode,
                )}
              >
                {formatMoney(
                  Number(
                    activeItem.totalIncome,
                  ),
                  activeItem.currencyCode,
                )}
              </p>
            </div>

            <div>
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-semibold
                  tracking-[0.1em]
                  text-danger
                "
              >
                <ArrowUpRight
                  size={13}
                  aria-hidden
                />

                EXPENSES
              </div>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  font-semibold
                  text-ink
                "
                title={formatMoney(
                  Number(
                    activeItem.totalExpenses,
                  ),
                  activeItem.currencyCode,
                )}
              >
                {formatMoney(
                  Number(
                    activeItem.totalExpenses,
                  ),
                  activeItem.currencyCode,
                )}
              </p>
            </div>

            <Link
              to="/transactions"
              className="
                inline-flex
                cursor-pointer
                items-center
                gap-2
                text-sm font-semibold
                text-accent
                transition
                hover:text-primary
              "
            >
              Transactions

              <ArrowRight
                size={15}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
