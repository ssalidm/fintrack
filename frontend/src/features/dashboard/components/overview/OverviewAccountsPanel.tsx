import {
  ArrowRight,
  Banknote,
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router'

import { formatMoney } from '@/utils/formatters'
import type { AccountType } from '@/features/accounts/api/types'
import { useAccountBalances } from '@/features/accounts/hooks/useAccounts'

function accountIcon(
  type: AccountType,
) {
  switch (type) {
    case 'CREDIT_CARD':
      return CreditCard
    case 'SAVINGS':
      return PiggyBank
    case 'INVESTMENT':
      return TrendingUp
    case 'CURRENT':
      return Landmark
    case 'CASH':
      return Banknote
    default:
      return Wallet
  }
}

export default function OverviewAccountsPanel() {
  const balancesQuery =
    useAccountBalances()

  const accounts = (
    balancesQuery.data ?? []
  )
    .filter(
      (account) =>
        account.status === 'ACTIVE',
    )
    .slice(0, 3)

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
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-ink">
          Accounts
        </h2>

        <Link
          to="/accounts"
          className="
            inline-flex
            items-center
            gap-1.5
            text-xs font-semibold
            text-accent
            transition
            hover:text-primary
          "
        >
          View all

          <ArrowRight
            size={13}
            aria-hidden
          />
        </Link>
      </div>

      {balancesQuery.isPending && (
        <div className="mt-4 space-y-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-xl bg-surface-muted"
            />
          ))}
        </div>
      )}

      {balancesQuery.isError && (
        <div
          className="mt-5"
          role="alert"
        >
          <p className="text-sm text-danger">
            Accounts could not be loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              void balancesQuery.refetch()
            }
            className="mt-2 cursor-pointer text-xs font-semibold text-accent underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {balancesQuery.isSuccess &&
        accounts.length === 0 && (
          <p className="mt-5 text-sm leading-6 text-muted">
            Your active accounts will
            appear here.
          </p>
        )}

      {accounts.length > 0 && (
        <div className="mt-4 divide-y divide-line/50">
          {accounts.map(
            (account) => {
              const Icon =
                accountIcon(
                  account.accountType,
                )

              return (
                <div
                  key={
                    account.accountId
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    py-3
                  "
                >
                  <span
                    className="
                      grid size-9
                      shrink-0
                      place-items-center
                      rounded-lg
                      bg-accent-soft
                      text-accent
                    "
                  >
                    <Icon
                      size={16}
                      aria-hidden
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {
                        account.accountName
                      }
                    </p>

                    <p className="mt-0.5 text-xs capitalize text-subtle">
                      {account.accountType
                        .toLowerCase()
                        .replaceAll(
                          '_',
                          ' ',
                        )}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-ink">
                    {formatMoney(
                      Number(
                        account.currentBalance,
                      ),
                      account.currencyCode,
                    )}
                  </p>
                </div>
              )
            },
          )}
        </div>
      )}
    </section>
  )
}
