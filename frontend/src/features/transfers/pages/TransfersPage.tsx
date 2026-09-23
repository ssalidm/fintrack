import {
  useMemo,
  useState,
} from 'react'
import {
  ArrowRight,
  ArrowRightLeft,
  Ban,
  Filter,
  Plus,
} from 'lucide-react'

import { ApiClientError } from '../../../api/ApiClientError'
import RefreshButton from '../../../components/actions/RefreshButton'
import PageHeader from '../../../components/layout/PageHeader'
import PageShell from '../../../components/layout/PageShell'
import StatusTabs from '../../../components/navigation/StatusTabs'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorPanel from '../../../components/ui/ErrorPanel'
import Pagination from '../../../components/ui/Pagination'
import {
  formatDateOnly,
  formatMoney,
} from '../../../utils/formatters'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import type {
  Transfer,
  TransferStatus,
} from '../api/types'
import TransferModal from '../components/TransferModal'
import VoidTransferModal from '../components/VoidTransferModal'
import {
  defaultTransferFilters,
  useTransfers,
} from '../hooks/useTransfers'

const transferStatusOptions = [
  {
    value: 'POSTED',
    label: 'Posted',
  },
  {
    value: 'VOIDED',
    label: 'Voided',
  },
] satisfies Array<{
  value: TransferStatus
  label: string
}>

const filterFieldClasses =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10'

function fallbackAccountName(
  accountId: string,
) {
  return `Account · ${accountId.slice(
    0,
    8,
  )}`
}

function TransfersSkeleton() {
  return (
    <div className="feature-reveal feature-reveal-delay-2 mt-8 overflow-hidden rounded-2xl border border-line/50 bg-surface">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-[88px] animate-pulse border-b border-line/50 bg-surface-muted/40 last:border-0"
          />
        ),
      )}
    </div>
  )
}

export default function TransfersPage() {
  const [
    filters,
    setFilters,
  ] = useState(
    defaultTransferFilters,
  )

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false)

  const [
    transferToVoid,
    setTransferToVoid,
  ] = useState<Transfer | null>(
    null,
  )

  const transfersQuery =
    useTransfers(filters)

  const activeAccountsQuery =
    useAccounts('ACTIVE')

  const archivedAccountsQuery =
    useAccounts('ARCHIVED')

  const accounts = useMemo(
    () => {
      const accountMap =
        new Map(
          [
            ...(activeAccountsQuery.data ??
              []),
            ...(archivedAccountsQuery.data ??
              []),
          ].map((account) => [
            account.id,
            account,
          ]),
        )

      return Array.from(
        accountMap.values(),
      )
    },
    [
      activeAccountsQuery.data,
      archivedAccountsQuery.data,
    ],
  )

  const accountById = useMemo(
    () =>
      new Map(
        accounts.map(
          (account) => [
            account.id,
            account,
          ],
        ),
      ),
    [accounts],
  )

  const page =
    transfersQuery.data

  const transfers =
    page?.items ?? []

  const hasFilters =
    filters.status !== 'POSTED' ||
    Boolean(
      filters.sourceAccountId,
    ) ||
    Boolean(
      filters.destinationAccountId,
    ) ||
    Boolean(filters.fromDate) ||
    Boolean(filters.toDate)

  const errorMessage =
    transfersQuery.error instanceof
    ApiClientError
      ? transfersQuery.error
          .message
      : 'Unable to load your transfers.'

  function updatePage(
    nextPage: number,
  ) {
    setFilters((current) => ({
      ...current,
      page: nextPage,
    }))
  }

  function clearFilters() {
    setFilters(
      defaultTransferFilters,
    )
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Money in motion"
        title="Transfers"
        description="Move money between your accounts and keep a clear record of every transfer."
        actions={
          <>
            <RefreshButton
              isRefreshing={
                transfersQuery.isFetching
              }
              onRefresh={
                transfersQuery.refetch
              }
              label="Refresh transfers"
              iconOnly
            />

            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(
                  true,
                )
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
            >
              <Plus
                size={18}
                aria-hidden
              />

              New transfer
            </button>
          </>
        }
      />

      <section className="feature-reveal feature-reveal-delay-1 mt-10 rounded-2xl border border-line/50 bg-surface p-5 shadow-[0_10px_30px_rgba(23,60,50,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-surface-muted text-muted">
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
                Find a specific
                transfer.
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="cursor-pointer text-xs font-semibold text-warning transition hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-5">
          <StatusTabs
            value={
              filters.status
            }
            options={
              transferStatusOptions
            }
            onChange={(status) =>
              setFilters(
                (current) => ({
                  ...current,
                  status,
                  page: 0,
                }),
              )
            }
            ariaLabel="Transfer status"
            variant="pill"
          />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="type-label">
              From account
            </span>

            <select
              value={
                filters.sourceAccountId ??
                ''
              }
              onChange={(event) =>
                setFilters(
                  (current) => ({
                    ...current,
                    sourceAccountId:
                      event.target
                        .value ||
                      undefined,
                    page: 0,
                  }),
                )
              }
              className={`${filterFieldClasses} mt-2 cursor-pointer pr-10`}
            >
              <option value="">
                All source accounts
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

          <label className="block">
            <span className="type-label">
              To account
            </span>

            <select
              value={
                filters.destinationAccountId ??
                ''
              }
              onChange={(event) =>
                setFilters(
                  (current) => ({
                    ...current,
                    destinationAccountId:
                      event.target
                        .value ||
                      undefined,
                    page: 0,
                  }),
                )
              }
              className={`${filterFieldClasses} mt-2 cursor-pointer pr-10`}
            >
              <option value="">
                All destination
                accounts
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

          <label className="block">
            <span className="type-label">
              From date
            </span>

            <input
              type="date"
              value={
                filters.fromDate ?? ''
              }
              max={filters.toDate}
              onChange={(event) =>
                setFilters(
                  (current) => ({
                    ...current,
                    fromDate:
                      event.target
                        .value ||
                      undefined,
                    page: 0,
                  }),
                )
              }
              className={`${filterFieldClasses} mt-2`}
            />
          </label>

          <label className="block">
            <span className="type-label">
              To date
            </span>

            <input
              type="date"
              value={
                filters.toDate ?? ''
              }
              min={filters.fromDate}
              onChange={(event) =>
                setFilters(
                  (current) => ({
                    ...current,
                    toDate:
                      event.target
                        .value ||
                      undefined,
                    page: 0,
                  }),
                )
              }
              className={`${filterFieldClasses} mt-2`}
            />
          </label>
        </div>
      </section>

      {transfersQuery.isPending && (
        <TransfersSkeleton />
      )}

      {transfersQuery.error && (
        <ErrorPanel
          title="We couldn’t load your transfers"
          message={
            errorMessage
          }
          onRetry={() =>
            void transfersQuery.refetch()
          }
          className="feature-reveal feature-reveal-delay-2 mt-8"
        />
      )}

      {transfersQuery.isSuccess &&
        transfers.length === 0 && (
          <EmptyState
            icon={
              <ArrowRightLeft
                size={22}
                aria-hidden
              />
            }
            title="No transfers found"
            description={
              hasFilters
                ? 'Try adjusting your filters to widen the results.'
                : 'Move money between two accounts and your transfer history will appear here.'
            }
            action={
              !hasFilters ? (
                <button
                  type="button"
                  onClick={() =>
                    setIsCreateOpen(
                      true,
                    )
                  }
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
                >
                  <Plus
                    size={16}
                    aria-hidden
                  />

                  Make a transfer
                </button>
              ) : undefined
            }
            variant="solid"
            className="feature-reveal feature-reveal-delay-2 mt-8"
          />
        )}

      {transfers.length > 0 && (
        <section className="feature-reveal feature-reveal-delay-2 mt-8 overflow-hidden rounded-2xl border border-line/50 bg-surface shadow-[0_10px_30px_rgba(23,60,50,0.04)]">
          <div className="flex items-center justify-between gap-4 border-b border-line/50 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Transfer history
              </h2>

              <p className="mt-0.5 text-xs text-subtle">
                {page?.totalElements ??
                  transfers.length}{' '}
                {(page?.totalElements ??
                  transfers.length) ===
                1
                  ? 'transfer'
                  : 'transfers'}
              </p>
            </div>

            {transfersQuery.isFetching && (
              <span className="text-xs font-medium text-muted">
                Updating…
              </span>
            )}
          </div>

          {transfers.map(
            (
              transfer,
              index,
            ) => {
              const sourceAccount =
                accountById.get(
                  transfer.sourceAccountId,
                )

              const destinationAccount =
                accountById.get(
                  transfer.destinationAccountId,
                )

              const sourceAccountName =
                sourceAccount?.name ??
                fallbackAccountName(
                  transfer.sourceAccountId,
                )

              const destinationAccountName =
                destinationAccount?.name ??
                fallbackAccountName(
                  transfer.destinationAccountId,
                )

              return (
                <article
                  key={
                    transfer.id
                  }
                  className={`grid gap-4 px-5 py-4 transition hover:bg-surface-muted/35 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center ${
                    index > 0
                      ? 'border-t border-line/50'
                      : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        transfer.status ===
                        'POSTED'
                          ? 'bg-success-soft text-success'
                          : 'bg-surface-strong text-muted'
                      }`}
                    >
                      <ArrowRightLeft
                        size={17}
                        aria-hidden
                      />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-ink">
                          {
                            sourceAccountName
                          }
                        </p>

                        <ArrowRight
                          size={14}
                          className="shrink-0 text-warning"
                          aria-hidden
                        />

                        <p className="truncate text-sm font-semibold text-ink">
                          {
                            destinationAccountName
                          }
                        </p>
                      </div>

                      <p className="mt-1 truncate text-xs text-subtle">
                        {formatDateOnly(
                          transfer.transactionDate,
                        )}

                        {transfer.description &&
                          ` · ${transfer.description}`}
                      </p>

                      {transfer.status ===
                        'VOIDED' &&
                        transfer.voidReason && (
                          <p className="mt-1 text-xs text-danger">
                            Voided:{' '}
                            {
                              transfer.voidReason
                            }
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="pl-[52px] lg:pl-0 lg:text-right">
                    <p
                      className={`text-sm font-semibold ${
                        transfer.status ===
                        'VOIDED'
                          ? 'text-subtle line-through'
                          : 'text-ink'
                      }`}
                    >
                      {formatMoney(
                        transfer.amount,
                        sourceAccount?.currencyCode,
                      )}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${
                        transfer.status ===
                        'POSTED'
                          ? 'bg-success-soft text-success'
                          : 'bg-surface-strong text-muted'
                      }`}
                    >
                      {
                        transfer.status
                      }
                    </span>
                  </div>

                  <div className="flex justify-end pl-[52px] lg:pl-0">
                    {transfer.status ===
                    'POSTED' ? (
                      <button
                        type="button"
                        onClick={() =>
                          setTransferToVoid(
                            transfer,
                          )
                        }
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-danger/20 px-4 py-2 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                      >
                        <Ban
                          size={14}
                          aria-hidden
                        />

                        Void
                      </button>
                    ) : (
                      <span className="text-xs text-subtle">
                        No actions
                      </span>
                    )}
                  </div>
                </article>
              )
            },
          )}
        </section>
      )}

      {page &&
        !transfersQuery.error &&
        page.totalPages > 1 && (
          <div className="feature-reveal feature-reveal-delay-3 mt-6">
            <Pagination
              label="Transfer history pages"
              page={page.page}
              totalPages={
                page.totalPages
              }
              onPageChange={
                updatePage
              }
              isFetching={
                transfersQuery.isFetching
              }
              summary={
                <>
                  Page{' '}
                  {page.page + 1} of{' '}
                  {
                    page.totalPages
                  }
                  {' · '}
                  {
                    page.totalElements
                  }{' '}
                  {page.totalElements ===
                  1
                    ? 'transfer'
                    : 'transfers'}
                </>
              }
            />
          </div>
        )}

      <TransferModal
        isOpen={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
      />

      {transferToVoid && (
        <VoidTransferModal
          transfer={
            transferToVoid
          }
          sourceAccountName={
            accountById.get(
              transferToVoid.sourceAccountId,
            )?.name ??
            fallbackAccountName(
              transferToVoid.sourceAccountId,
            )
          }
          destinationAccountName={
            accountById.get(
              transferToVoid.destinationAccountId,
            )?.name ??
            fallbackAccountName(
              transferToVoid.destinationAccountId,
            )
          }
          onClose={() =>
            setTransferToVoid(
              null,
            )
          }
        />
      )}
    </PageShell>
  )
}
