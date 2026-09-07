import {
  ArrowRight,
  Landmark,
  Scale,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import type { NetWorthSummary } from '../api/types'

interface NetWorthCardProps {
  items: NetWorthSummary[]
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
  const [selectedCurrency, setSelectedCurrency] =
    useState('')

  const activeItem =
    items.find(
      (item) =>
        item.currencyCode === selectedCurrency,
    ) ?? items[0]

  return (
    <article className="relative flex min-h-[250px] flex-col overflow-hidden rounded-3xl bg-[#173c32] p-6 text-[#f8f4e9] shadow-[0_18px_45px_rgba(23,60,50,0.16)]">
      <div
        className="pointer-events-none absolute -top-20 -right-16 size-48 rounded-full border border-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-5 -bottom-20 size-40 rounded-full bg-[#d6a45f]/10"
        aria-hidden
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-white/10 text-[#e7bd7e]">
            <Landmark size={18} aria-hidden />
          </span>

          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#bed0c8]">
              NET WORTH
            </p>
            <p className="mt-1 text-xs text-[#91aca1]">
              Your complete position
            </p>
          </div>
        </div>

        {items.length > 1 && activeItem && (
          <select
            value={activeItem.currencyCode}
            onChange={(event) =>
              setSelectedCurrency(event.target.value)
            }
            aria-label="Net worth currency"
            className="cursor-pointer rounded-full border border-white/20 bg-white/10 py-2 pr-9 pl-3 text-xs font-semibold text-[#fffdf8] outline-none focus:border-[#e7bd7e]"
          >
            {items.map((item) => (
              <option
                key={item.currencyCode}
                value={item.currencyCode}
                className="text-[#173c32]"
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
            <p className="font-serif text-2xl">
              No accounts yet
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#bed0c8]">
              Add an account to begin building your financial picture.
            </p>
          </div>

          <Link
            to="/accounts"
            className="mt-5 inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-[#e7bd7e]"
          >
            Add an account
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="relative mt-7 flex flex-1 flex-col">
          <p className="text-xs font-medium text-[#91aca1]">
            {activeItem.currencyCode} total
          </p>

          <p
            className="mt-1 truncate font-serif text-4xl tracking-[-0.04em] text-white xl:text-[2.6rem]"
            title={formatMoney(
              Number(activeItem.netWorth),
              activeItem.currencyCode,
            )}
          >
            {formatMoney(
              Number(activeItem.netWorth),
              activeItem.currencyCode,
            )}
          </p>

          <div className="mt-auto grid grid-cols-[1fr_1fr_auto] items-stretch gap-2 pt-6">
            <div className="rounded-2xl bg-white/[0.07] px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-[0.1em] text-[#91aca1]">
                INCLUDED
              </p>
              <p className="mt-1 text-sm font-semibold text-[#f8f4e9]">
                {activeItem.includeAccountCount}{' '}
                {activeItem.includeAccountCount === 1
                  ? 'account'
                  : 'accounts'}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.07] px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-[0.1em] text-[#91aca1]">
                POSITION
              </p>
              <p
                className={[
                  'mt-1 text-sm font-semibold',
                  Number(activeItem.netWorth) < 0
                    ? 'text-[#f0b6a4]'
                    : 'text-[#b9d7c2]',
                ].join(' ')}
              >
                {positionLabel(
                  Number(activeItem.netWorth),
                )}
              </p>
            </div>

            <Link
              to="/accounts"
              title="View accounts"
              aria-label="View accounts"
              className="grid w-10 cursor-pointer place-items-center rounded-2xl border border-white/15 text-[#e7bd7e] transition hover:border-[#e7bd7e]/70 hover:bg-white/10"
            >
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          {items.length === 1 && (
            <Scale
              size={70}
              strokeWidth={1}
              className="pointer-events-none absolute right-2 top-0 text-white/[0.07]"
              aria-hidden
            />
          )}
        </div>
      )}
    </article>
  )
}
