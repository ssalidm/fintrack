import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import type { MonthlyCashFlow } from '../api/types'

interface MonthlyCashFlowCardProps {
  items: MonthlyCashFlow[]
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

export default function MonthlyCashFlowCard({
  items,
}: MonthlyCashFlowCardProps) {
  const [selectedCurrency, setSelectedCurrency] =
    useState('')

  const activeItem =
    items.find(
      (item) =>
        item.currencyCode === selectedCurrency,
    ) ?? items[0]

  const netCashFlow = Number(
    activeItem?.netCashFlow ?? 0,
  )
  const isPositive = netCashFlow >= 0

  return (
    <article className="relative flex min-h-[250px] flex-col overflow-hidden rounded-3xl border border-[#e2d8c5] bg-[linear-gradient(145deg,#fffdf8_0%,#f4ead8_100%)] p-6">
      <div
        className="pointer-events-none absolute -right-10 -bottom-14 size-40 rounded-full bg-[#d9b980]/20"
        aria-hidden
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#ead9b9] text-[#8b642e]">
            <CalendarDays size={18} aria-hidden />
          </span>

          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#786c59]">
              THIS MONTH
            </p>
            <p className="mt-1 text-xs text-[#8f816b]">
              Money in and money out
            </p>
          </div>
        </div>

        {items.length > 1 && activeItem && (
          <select
            value={activeItem.currencyCode}
            onChange={(event) =>
              setSelectedCurrency(event.target.value)
            }
            aria-label="Cash flow currency"
            className="cursor-pointer rounded-full border border-[#d6c7ae] bg-[#fffaf0] py-2 pr-9 pl-3 text-xs font-semibold text-[#173c32] outline-none focus:border-[#b88949]"
          >
            {items.map((item) => (
              <option
                key={item.currencyCode}
                value={item.currencyCode}
              >
                {item.currencyCode}
              </option>
            ))}
          </select>
        )}
      </header>

      {!activeItem ? (
        <div className="relative mt-8 flex flex-1 flex-col justify-between">
          <div>
            <p className="font-serif text-2xl text-[#173c32]">
              No movement yet
            </p>
            <p className="mt-2 text-sm leading-6 text-[#786c59]">
              Your first posted transaction will bring this card to life.
            </p>
          </div>

          <Link
            to="/transactions"
            className="mt-5 inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-[#9a6828]"
          >
            Add a transaction
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="relative mt-6 flex flex-1 flex-col">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#786c59]">
                Net cash flow
              </p>
              <p
                className={[
                  'mt-1 truncate font-serif text-3xl tracking-[-0.035em]',
                  isPositive
                    ? 'text-[#2f6d54]'
                    : 'text-[#a85e49]',
                ].join(' ')}
                title={formatMoney(
                  netCashFlow,
                  activeItem.currencyCode,
                )}
              >
                {isPositive ? '+' : ''}
                {formatMoney(
                  netCashFlow,
                  activeItem.currencyCode,
                )}
              </p>
            </div>

            <span
              className={[
                'mb-1 rounded-full px-3 py-1.5 text-[11px] font-semibold',
                isPositive
                  ? 'bg-[#dce9df] text-[#2f6d54]'
                  : 'bg-[#f1ddd5] text-[#934f3e]',
              ].join(' ')}
            >
              {isPositive
                ? 'Keeping more'
                : 'Spending more'}
            </span>
          </div>

          <div className="mt-auto grid grid-cols-[1fr_1fr_auto] items-stretch gap-2 pt-5">
            <div className="rounded-2xl border border-[#d5dfd4] bg-[#eef4ed]/80 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#507261]">
                <ArrowDownLeft size={13} aria-hidden />
                INCOME
              </div>
              <p
                className="mt-1 truncate text-sm font-bold text-[#2f6d54]"
                title={formatMoney(
                  Number(activeItem.totalIncome),
                  activeItem.currencyCode,
                )}
              >
                {formatMoney(
                  Number(activeItem.totalIncome),
                  activeItem.currencyCode,
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-[#ead5cc] bg-[#f8eae3]/80 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#98604f]">
                <ArrowUpRight size={13} aria-hidden />
                EXPENSES
              </div>
              <p
                className="mt-1 truncate text-sm font-bold text-[#9b5745]"
                title={formatMoney(
                  Number(activeItem.totalExpenses),
                  activeItem.currencyCode,
                )}
              >
                {formatMoney(
                  Number(activeItem.totalExpenses),
                  activeItem.currencyCode,
                )}
              </p>
            </div>

            <Link
              to="/transactions"
              title="View transactions"
              aria-label="View transactions"
              className="grid w-10 cursor-pointer place-items-center rounded-2xl border border-[#d6c7ae] bg-[#fffaf0]/80 text-[#9a6828] transition hover:border-[#b88949]"
            >
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
