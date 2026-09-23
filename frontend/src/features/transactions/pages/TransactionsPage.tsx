import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CircleSlash2,
  Filter,
  Pencil,
  Plus,
} from 'lucide-react'

import { ApiClientError } from '../../../api/ApiClientError'
import RefreshButton from '../../../components/actions/RefreshButton'
import PageHeader from '../../../components/layout/PageHeader'
import PageShell from '../../../components/layout/PageShell'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorPanel from '../../../components/ui/ErrorPanel'
import Pagination from '../../../components/ui/Pagination'
import { formatDateOnly, formatMoney } from '../../../utils/formatters'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCategories } from '../../categories/hooks/useCategories'
import type {
  Transaction,
  TransactionFilters,
  TransactionType,
} from '../api/types'
import TransactionModal from '../components/TransactionModal'
import VoidTransactionModal from '../components/VoidTransactionModal'
import {
  defaultTransactionFilters,
  useTransactions,
} from '../hooks/useTransactions'

const transactionTypeLabels = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER_IN: 'Transfer received',
  TRANSFER_OUT: 'Transfer sent',
} satisfies Record<TransactionType, string>

const filterFieldClasses =
  'mt-2 block w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10'

function TransactionIcon({
  type,
}: {
  type: TransactionType
}) {
  const classes =
    type === 'INCOME'
      ? 'bg-success-soft text-success'
      : type === 'EXPENSE'
        ? 'bg-danger-soft text-danger'
        : 'bg-surface-strong text-muted'

  return (
    <span
      className={`grid size-10 shrink-0 place-items-center rounded-xl ${classes}`}
    >
      {type === 'INCOME' && (
        <ArrowDownLeft
          size={17}
          aria-hidden
        />
      )}

      {type === 'EXPENSE' && (
        <ArrowUpRight
          size={17}
          aria-hidden
        />
      )}

      {(type === 'TRANSFER_IN' ||
        type === 'TRANSFER_OUT') && (
        <ArrowLeftRight
          size={17}
          aria-hidden
        />
      )}
    </span>
  )
}

export default function TransactionsPage() {
  const [filters, setFilters] =
    useState<TransactionFilters>({
      ...defaultTransactionFilters,
    })

  const [isFormOpen, setIsFormOpen] =
    useState(false)

  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState<Transaction | null>(
    null,
  )

  const [voidTarget, setVoidTarget] =
    useState<Transaction | null>(
      null,
    )

  const transactionsQuery =
    useTransactions(filters)

  const activeAccountsQuery =
    useAccounts('ACTIVE')

  const archivedAccountsQuery =
    useAccounts('ARCHIVED')

  const activeCategoriesQuery =
    useCategories()

  const archivedCategoriesQuery =
    useCategories(
      undefined,
      'ARCHIVED',
    )

  const transactions =
    transactionsQuery.data?.items ??
    []

  const accounts = [
    ...(activeAccountsQuery.data ??
      []),
    ...(archivedAccountsQuery.data ??
      []),
  ]

  const categories = [
    ...(activeCategoriesQuery.data ??
      []),
    ...(archivedCategoriesQuery.data ??
      []),
  ]

  const accountsById = new Map(
    accounts.map((account) => [
      account.id,
      account,
    ]),
  )

  const categoriesById = new Map(
    categories.map((category) => [
      category.id,
      category,
    ]),
  )

  function updateFilters(
    update: Partial<TransactionFilters>,
  ) {
    setFilters((current) => ({
      ...current,
      ...update,
      page: update.page ?? 0,
    }))
  }

  function clearFilters() {
    setFilters({
      ...defaultTransactionFilters,
    })
  }

  function openCreateForm() {
    setEditingTransaction(null)
    setIsFormOpen(true)
  }

  function openEditForm(
    transaction: Transaction,
  ) {
    setEditingTransaction(
      transaction,
    )
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingTransaction(null)
  }

  const hasFilters =
    Boolean(filters.accountId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.type) ||
    Boolean(filters.fromDate) ||
    Boolean(filters.toDate) ||
    filters.status !== 'POSTED'

  const totalTransactions =
    transactionsQuery.data
      ?.totalElements ?? 0

  return (
    <PageShell>
      <PageHeader
        eyebrow="Money in motion"
        title="Transactions"
        description="Follow every income, expense and transfer across your accounts."
        actions={
          <>
            <RefreshButton
              isRefreshing={
                transactionsQuery.isFetching
              }
              onRefresh={
                transactionsQuery.refetch
              }
              label="Refresh transactions"
              iconOnly
            />

            <button
              type="button"
              onClick={openCreateForm}
              className="
                inline-flex
                cursor-pointer
                items-center
                gap-2
                rounded-full
                bg-primary
                px-5 py-3
                text-sm font-semibold
                text-inverse
                transition
                hover:bg-primary-hover
              "
            >
              <Plus
                size={18}
                aria-hidden
              />
              Add transaction
            </button>
          </>
        }
      />

      <section
        className="
          feature-reveal
          feature-reveal-delay-1
          mt-10
          rounded-2xl
          border border-line/50
          bg-surface
          p-5
          shadow-[0_10px_30px_rgba(23,60,50,0.04)]
        "
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="
                grid size-8
                place-items-center
                rounded-lg
                bg-surface-muted
                text-muted
              "
            >
              <Filter
                size={15}
                aria-hidden
              />
            </span>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Filters
              </h2>

              <p className="text-xs text-subtle">
                Narrow down your
                activity.
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                cursor-pointer
                text-xs font-semibold
                text-warning
                transition
                hover:text-ink
              "
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-semibold text-muted">
            Type
            <select
              value={
                filters.type ?? ''
              }
              onChange={(event) =>
                updateFilters({
                  type: (
                    event.target.value ||
                    undefined
                  ) as
                    | TransactionType
                    | undefined,
                })
              }
              className={`${filterFieldClasses} cursor-pointer pr-10`}
            >
              <option value="">
                All types
              </option>
              <option value="INCOME">
                Income
              </option>
              <option value="EXPENSE">
                Expense
              </option>
              <option value="TRANSFER_IN">
                Transfer received
              </option>
              <option value="TRANSFER_OUT">
                Transfer sent
              </option>
            </select>
          </label>

          <label className="text-xs font-semibold text-muted">
            Account
            <select
              value={
                filters.accountId ??
                ''
              }
              onChange={(event) =>
                updateFilters({
                  accountId:
                    event.target
                      .value ||
                    undefined,
                })
              }
              className={`${filterFieldClasses} cursor-pointer pr-10`}
            >
              <option value="">
                All accounts
              </option>

              {accounts.map(
                (account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="text-xs font-semibold text-muted">
            Status
            <select
              value={filters.status}
              onChange={(event) =>
                updateFilters({
                  status:
                    event.target
                      .value as TransactionFilters['status'],
                })
              }
              className={`${filterFieldClasses} cursor-pointer pr-10`}
            >
              <option value="POSTED">
                Posted
              </option>
              <option value="VOIDED">
                Voided
              </option>
            </select>
          </label>

          <label className="text-xs font-semibold text-muted">
            From
            <input
              type="date"
              value={
                filters.fromDate ?? ''
              }
              onChange={(event) =>
                updateFilters({
                  fromDate:
                    event.target
                      .value ||
                    undefined,
                })
              }
              className={filterFieldClasses}
            />
          </label>

          <label className="text-xs font-semibold text-muted">
            To
            <input
              type="date"
              value={
                filters.toDate ?? ''
              }
              onChange={(event) =>
                updateFilters({
                  toDate:
                    event.target
                      .value ||
                    undefined,
                })
              }
              className={filterFieldClasses}
            />
          </label>
        </div>
      </section>

      {transactionsQuery.isPending && (
        <div
          className="
            feature-reveal
            feature-reveal-delay-2
            mt-8
            overflow-hidden
            rounded-2xl
            border border-line/50
            bg-surface
          "
        >
          {[1, 2, 3, 4, 5].map(
            (item) => (
              <div
                key={item}
                className="
                  h-[76px]
                  animate-pulse
                  border-b border-line/50
                  bg-surface-muted/40
                  last:border-0
                "
              />
            ),
          )}
        </div>
      )}

      {transactionsQuery.error && (
        <ErrorPanel
          title="We couldn’t load your transactions"
          message={
            transactionsQuery.error instanceof
            ApiClientError
              ? transactionsQuery
                  .error.message
              : 'Please try again.'
          }
          onRetry={() =>
            void transactionsQuery.refetch()
          }
          className="feature-reveal feature-reveal-delay-2 mt-8"
        />
      )}

      {transactionsQuery.isSuccess &&
        transactions.length === 0 && (
          <EmptyState
            icon={
              <ArrowLeftRight
                size={22}
                aria-hidden
              />
            }
            title="No transactions found"
            description={
              hasFilters
                ? 'Try adjusting your filters to widen the results.'
                : 'Record your first income or expense to begin tracking your activity.'
            }
            action={
              !hasFilters ? (
                <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                  className="
                    mt-5
                    inline-flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-full
                    bg-primary
                    px-5 py-2.5
                    text-sm font-semibold
                    text-inverse
                    transition
                    hover:bg-primary-hover
                  "
                >
                  <Plus
                    size={16}
                    aria-hidden
                  />
                  Add transaction
                </button>
              ) : undefined
            }
            variant="solid"
            className="feature-reveal feature-reveal-delay-2 mt-8"
          />
        )}

      {!transactionsQuery.isPending &&
        !transactionsQuery.error &&
        transactions.length > 0 && (
          <section
            className="
              feature-reveal
              feature-reveal-delay-2
              mt-8
              overflow-hidden
              rounded-2xl
              border border-line/50
              bg-surface
              shadow-[0_10px_30px_rgba(23,60,50,0.04)]
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                border-b border-line/50
                px-5 py-4
                sm:px-6
              "
            >
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Transaction history
                </h2>

                <p className="mt-0.5 text-xs text-subtle">
                  {totalTransactions}{' '}
                  {totalTransactions === 1
                    ? 'transaction'
                    : 'transactions'}
                </p>
              </div>

              {transactionsQuery.isFetching && (
                <span className="text-xs font-medium text-muted">
                  Updating…
                </span>
              )}
            </div>

            <div>
              {transactions.map(
                (
                  transaction,
                  index,
                ) => {
                  const account =
                    accountsById.get(
                      transaction.accountId,
                    )

                  const category =
                    transaction.categoryId
                      ? categoriesById.get(
                          transaction.categoryId,
                        )
                      : undefined

                  const isIncoming =
                    transaction.transactionType ===
                      'INCOME' ||
                    transaction.transactionType ===
                      'TRANSFER_IN'

                  const canModify =
                    transaction.status ===
                      'POSTED' &&
                    transaction.transferId ===
                      null

                  return (
                    <article
                      key={
                        transaction.id
                      }
                      className={`
                        grid
                        gap-3
                        px-5 py-4
                        transition
                        hover:bg-surface-muted/35
                        sm:grid-cols-[minmax(0,1fr)_auto]
                        sm:items-center
                        sm:px-6
                        ${
                          index > 0
                            ? 'border-t border-line/50'
                            : ''
                        }
                      `}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <TransactionIcon
                          type={
                            transaction.transactionType
                          }
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-ink">
                              {transaction.merchantName ||
                                transaction.description ||
                                transactionTypeLabels[
                                  transaction
                                    .transactionType
                                ]}
                            </h3>

                            {transaction.status ===
                              'VOIDED' && (
                              <span
                                className="
                                  rounded-full
                                  bg-surface-strong
                                  px-2 py-0.5
                                  text-[9px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.08em]
                                  text-muted
                                "
                              >
                                Voided
                              </span>
                            )}
                          </div>

                          <p className="mt-1 truncate text-xs text-subtle">
                            {category?.name ??
                              transactionTypeLabels[
                                transaction
                                  .transactionType
                              ]}
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

                      <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0">
                        <p
                          className={`
                            text-sm
                            font-semibold
                            ${
                              transaction.status ===
                              'VOIDED'
                                ? 'text-subtle line-through'
                                : isIncoming
                                  ? 'text-success'
                                  : 'text-danger'
                            }
                          `}
                        >
                          {isIncoming
                            ? '+'
                            : '−'}
                          {formatMoney(
                            transaction.amount,
                            account?.currencyCode,
                          )}
                        </p>

                        {canModify && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  transaction,
                                )
                              }
                              className="
                                grid size-8
                                cursor-pointer
                                place-items-center
                                rounded-full
                                text-muted
                                transition
                                hover:bg-accent-soft
                                hover:text-accent
                              "
                              aria-label="Edit transaction"
                              title="Edit transaction"
                            >
                              <Pencil
                                size={15}
                                aria-hidden
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setVoidTarget(
                                  transaction,
                                )
                              }
                              className="
                                grid size-8
                                cursor-pointer
                                place-items-center
                                rounded-full
                                text-muted
                                transition
                                hover:bg-danger-soft
                                hover:text-danger
                              "
                              aria-label="Void transaction"
                              title="Void transaction"
                            >
                              <CircleSlash2
                                size={15}
                                aria-hidden
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          </section>
        )}

      {transactionsQuery.data &&
        !transactionsQuery.error &&
        transactionsQuery.data
          .totalPages > 1 && (
          <div className="feature-reveal feature-reveal-delay-3 mt-6">
            <Pagination
              label="Transaction pages"
              page={
                transactionsQuery.data
                  .page
              }
              totalPages={
                transactionsQuery.data
                  .totalPages
              }
              onPageChange={(page) =>
                updateFilters({
                  page,
                })
              }
              isFetching={
                transactionsQuery.isFetching
              }
            />
          </div>
        )}

      {isFormOpen && (
        <TransactionModal
          key={
            editingTransaction?.id ??
            'new'
          }
          transaction={
            editingTransaction ??
            undefined
          }
          onClose={closeForm}
        />
      )}

      {voidTarget && (
        <VoidTransactionModal
          key={voidTarget.id}
          transaction={voidTarget}
          onClose={() =>
            setVoidTarget(null)
          }
        />
      )}
    </PageShell>
  )
}
