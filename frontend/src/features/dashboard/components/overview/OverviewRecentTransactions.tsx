import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Repeat2,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'

import {
  formatDateOnly,
  formatMoney,
} from '../../../../utils/formatters'
import { useAccounts } from '../../../accounts/hooks/useAccounts'
import { useCategories } from '../../../categories/hooks/useCategories'
import type { Transaction } from '../../../transactions/api/types'
import { useTransactions } from '../../../transactions/hooks/useTransactions'

const filters = {
  status: 'POSTED' as const,
  page: 0,
  size: 5,
}

function transactionTitle(
  transaction: Transaction,
) {
  return (
    transaction.merchantName?.trim() ||
    transaction.description?.trim() ||
    (
      transaction.transactionType ===
      'INCOME'
        ? 'Income'
        : transaction.transactionType ===
            'EXPENSE'
          ? 'Expense'
          : transaction.transactionType ===
              'TRANSFER_IN'
            ? 'Transfer received'
            : 'Transfer sent'
    )
  )
}

function appearance(
  type: Transaction['transactionType'],
) {
  if (type === 'INCOME') {
    return {
      Icon: ArrowDownLeft,
      prefix: '+',
      className: 'text-success',
      iconClassName:
        'bg-success-soft text-success',
    }
  }

  if (type === 'EXPENSE') {
    return {
      Icon: ArrowUpRight,
      prefix: '−',
      className: 'text-danger',
      iconClassName:
        'bg-danger-soft text-danger',
    }
  }

  return {
    Icon: Repeat2,
    prefix:
      type === 'TRANSFER_IN'
        ? '+'
        : '−',
    className: 'text-muted',
    iconClassName:
      'bg-surface-muted text-muted',
  }
}

export default function OverviewRecentTransactions() {
  const transactionsQuery =
    useTransactions(filters)

  const accountsQuery =
    useAccounts('ACTIVE')

  const incomeCategoriesQuery =
    useCategories(
      'INCOME',
      'ACTIVE',
    )

  const expenseCategoriesQuery =
    useCategories(
      'EXPENSE',
      'ACTIVE',
    )

  const accountById = useMemo(
    () =>
      new Map(
        (
          accountsQuery.data ?? []
        ).map((account) => [
          account.id,
          account,
        ]),
      ),
    [accountsQuery.data],
  )

  const categoryById =
    useMemo(() => {
      const categories = [
        ...(
          incomeCategoriesQuery.data ??
          []
        ),
        ...(
          expenseCategoriesQuery.data ??
          []
        ),
      ]

      return new Map(
        categories.map(
          (category) => [
            category.id,
            category,
          ],
        ),
      )
    }, [
      expenseCategoriesQuery.data,
      incomeCategoriesQuery.data,
    ])

  const transactions =
    transactionsQuery.data?.items ??
    []

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border border-line/50
        bg-surface
        shadow-[0_10px_30px_rgba(23,60,50,0.05)]
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          px-5 py-4
        "
      >
        <h2 className="text-base font-semibold text-ink">
          Recent transactions
        </h2>

        <Link
          to="/transactions"
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
          See all

          <ArrowRight
            size={13}
            aria-hidden
          />
        </Link>
      </div>

      <div className="border-t border-line/50">
        {transactionsQuery.isPending && (
          <div className="divide-y divide-line/50">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[68px] animate-pulse bg-surface-muted/40"
              />
            ))}
          </div>
        )}

        {transactionsQuery.isError && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-danger">
              Recent transactions could
              not be loaded.
            </p>

            <button
              type="button"
              onClick={() =>
                void transactionsQuery.refetch()
              }
              className="mt-2 cursor-pointer text-xs font-semibold text-accent underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {transactionsQuery.isSuccess &&
          transactions.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Your latest financial
              activity will appear here.
            </p>
          )}

        {transactions.map(
          (transaction) => {
            const account =
              accountById.get(
                transaction.accountId,
              )

            const category =
              transaction.categoryId
                ? categoryById.get(
                    transaction.categoryId,
                  )
                : undefined

            const style =
              appearance(
                transaction.transactionType,
              )

            const Icon =
              style.Icon

            return (
              <div
                key={
                  transaction.id
                }
                className="
                  grid
                  gap-3
                  border-t border-line/50
                  px-5 py-3.5
                  sm:grid-cols-[minmax(0,1fr)_auto]
                  sm:items-center
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`
                      grid size-9
                      shrink-0
                      place-items-center
                      rounded-lg
                      ${style.iconClassName}
                    `}
                  >
                    <Icon
                      size={15}
                      aria-hidden
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {transactionTitle(
                        transaction,
                      )}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-subtle">
                      {category?.name ??
                        (
                          transaction.transferId
                            ? 'Transfer'
                            : 'Uncategorised'
                        )}
                      {' · '}
                      {account?.name ??
                        'Unknown account'}
                      {' · '}
                      {formatDateOnly(
                        transaction.transactionDate,
                      )}
                    </p>
                  </div>
                </div>

                <p
                  className={`
                    pl-12
                    text-sm
                    font-semibold
                    sm:pl-0
                    ${style.className}
                  `}
                >
                  {style.prefix}
                  {formatMoney(
                    transaction.amount,
                    account?.currencyCode,
                  )}
                </p>
              </div>
            )
          },
        )}
      </div>
    </section>
  )
}
