import {
  ArrowRight,
  Landmark,
  Scale,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { formatMoney } from '../../../utils/formatters'
import type { NetWorthSummary } from '../api/types'

interface NetWorthCardProps {
  readonly items: NetWorthSummary[]
}

function positionLabel(netWorth: number) {
  if (netWorth > 0) {
    return 'Positive position'
  }

  if (netWorth < 0) {
    return 'Liabilities lead'
  }

  return 'Balanced position'
}

export default function NetWorthCard({
  items,
}: NetWorthCardProps) {
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

  const netWorth = Number(
    activeItem?.netWorth ?? 0,
  )

  return (
    <article
      className="
        relative
        flex min-h-[250px]
        flex-col
        overflow-hidden
        rounded-2xl
        bg-primary
        p-6
        text-inverse
        shadow-[0_16px_36px_rgba(23,60,50,0.14)]
      "
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="
              grid size-9
              place-items-center
              rounded-lg
              bg-white/10
              text-[#dfece3]
            "
          >
            <Landmark
              size={17}
              aria-hidden
            />
          </span>

          <div>
            <p className="type-eyebrow text-white/65">
              NET WORTH
            </p>

            <p className="mt-1 text-xs text-white/55">
              Across included accounts
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
              aria-label="Net worth currency"
              className="
                cursor-pointer
                rounded-md
                border border-white/15
                bg-white/10
                py-1.5 pr-8 pl-3
                text-xs font-semibold
                text-white
                outline-none
                transition
                focus:border-white/35
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
                  className="text-ink"
                >
                  {item.currencyCode}
                </option>
              ))}
            </select>
          )}
      </header>

      {!activeItem ? (
        <div className="mt-8 flex flex-1 flex-col justify-between">
          <div>
            <p className="type-card-title text-white">
              No accounts yet
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
              Add an account to begin
              building your financial
              picture.
            </p>
          </div>

          <Link
            to="/accounts"
            className="
              mt-6
              inline-flex
              w-fit
              cursor-pointer
              items-center
              gap-2
              text-sm font-semibold
              text-[#dfece3]
              transition
              hover:text-white
            "
          >
            Add an account

            <ArrowRight
              size={15}
              aria-hidden
            />
          </Link>
        </div>
      ) : (
        <div className="mt-7 flex flex-1 flex-col">
          <div>
            <p className="text-xs font-medium text-white/55">
              {activeItem.currencyCode}{' '}
              total
            </p>

            <p
              className="
                mt-1
                truncate
                text-4xl
                font-bold
                tracking-[-0.04em]
                text-white
                xl:text-[2.6rem]
              "
              title={formatMoney(
                netWorth,
                activeItem.currencyCode,
              )}
            >
              {formatMoney(
                netWorth,
                activeItem.currencyCode,
              )}
            </p>
          </div>

          <div
            className="
              mt-auto
              flex flex-wrap
              items-end
              justify-between
              gap-5
              border-t border-white/12
              pt-5
            "
          >
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-white/45">
                  INCLUDED
                </p>

                <p className="mt-1 text-sm font-semibold text-white/90">
                  {
                    activeItem.includeAccountCount
                  }{' '}
                  {activeItem.includeAccountCount ===
                  1
                    ? 'account'
                    : 'accounts'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-white/45">
                  POSITION
                </p>

                <p
                  className={`
                    mt-1
                    text-sm
                    font-semibold
                    ${
                      netWorth < 0
                        ? 'text-[#f0b6a4]'
                        : 'text-[#b9d7c2]'
                    }
                  `}
                >
                  {positionLabel(
                    netWorth,
                  )}
                </p>
              </div>
            </div>

            <Link
              to="/accounts"
              className="
                inline-flex
                cursor-pointer
                items-center
                gap-2
                text-sm font-semibold
                text-[#dfece3]
                transition
                hover:text-white
              "
            >
              Accounts

              <ArrowRight
                size={15}
                aria-hidden
              />
            </Link>
          </div>

          {items.length === 1 && (
            <Scale
              size={72}
              strokeWidth={1}
              className="
                pointer-events-none
                absolute
                right-5 top-20
                text-white/[0.05]
              "
              aria-hidden
            />
          )}
        </div>
      )}
    </article>
  )
}
