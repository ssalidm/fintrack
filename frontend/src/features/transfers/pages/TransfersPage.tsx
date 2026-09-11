import {
  useMemo,
  useState,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  Ban,
  Plus,
  RefreshCw,
} from 'lucide-react'
import {ApiClientError} from '../../../api/ApiClientError'
import {useAccounts} from '../../accounts/hooks/useAccounts'
import type {Transfer} from '../api/types'
import TransferModal from '../components/TransferModal'
import VoidTransferModal from '../components/VoidTransferModal'
import {
  defaultTransferFilters,
  useTransfers,
} from '../hooks/useTransfers'

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseLocalDate(value))
}

function formatAmount(
  amount: number,
  currencyCode?: string,
) {
  if (!currencyCode) {
    return new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

function fallbackAccountName(accountId: string) {
  return `Account · ${accountId.slice(0, 8)}`
}

function TransfersSkeleton() {
  return (
    <div className="feature-reveal feature-reveal-delay-3 mt-8 animate-pulse space-y-4">
      <div className="h-24 rounded-2xl bg-[#e5e8e1]"/>
      <div className="h-28 rounded-2xl bg-[#e5e8e1]"/>
      <div className="h-28 rounded-2xl bg-[#e5e8e1]"/>
      <div className="h-28 rounded-2xl bg-[#e5e8e1]"/>
    </div>
  )
}

export default function TransfersPage() {
  const [filters, setFilters] = useState(
    defaultTransferFilters,
  )

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [transferToVoid, setTransferToVoid] =
    useState<Transfer | null>(null)

  const transfersQuery = useTransfers(filters)
  const activeAccountsQuery = useAccounts('ACTIVE')
  const archivedAccountsQuery = useAccounts('ARCHIVED')

  const accounts = useMemo(() => {
    const accountMap = new Map(
      [
        ...(activeAccountsQuery.data ?? []),
        ...(archivedAccountsQuery.data ?? []),
      ].map((account) => [account.id, account]),
    )

    return Array.from(accountMap.values())
  }, [
    activeAccountsQuery.data,
    archivedAccountsQuery.data,
  ])

  const accountById = useMemo(
    () =>
      new Map(
        accounts.map((account) => [account.id, account]),
      ),
    [accounts],
  )

  const page = transfersQuery.data
  const transfers = page?.items ?? []

  const errorMessage =
    transfersQuery.error instanceof ApiClientError
      ? transfersQuery.error.message
      : 'Unable to load your transfers.'

  function updatePage(nextPage: number) {
    setFilters((current) => ({
      ...current,
      page: nextPage,
    }))
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        <header className="feature-reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
              MONEY IN MOTION
            </p>

            <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-[#173c32] sm:text-5xl">
              Transfers
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#657972]">
              Move money between your accounts and keep a clear
              record of every transfer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216353]"
          >
            <Plus size={17} aria-hidden/>
            New transfer
          </button>
        </header>

        <section className="feature-reveal feature-reveal-delay-1 mt-8 rounded-2xl border border-[#dedbd2] bg-[#fffdf8] p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr_1fr_auto_auto] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-[#657972]">
                STATUS
              </p>

              <div className="flex rounded-full bg-[#eef0ea] p-1">
                {(['POSTED', 'VOIDED'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          status,
                          page: 0,
                        }))
                      }
                      className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                        filters.status === status
                          ? 'bg-[#174f43] text-white shadow-sm'
                          : 'text-[#657972] hover:text-[#173c32]'
                      }`}
                    >
                      {status === 'POSTED'
                        ? 'Posted'
                        : 'Voided'}
                    </button>
                  ),
                )}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold tracking-[0.12em] text-[#657972]">
                FROM ACCOUNT
              </span>

              <select
                value={filters.sourceAccountId ?? ''}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    sourceAccountId:
                      event.target.value || undefined,
                    page: 0,
                  }))
                }
                className="w-full cursor-pointer rounded-xl border border-[#d8d5cc] bg-white px-4 py-2.5 pr-10 text-sm text-[#173c32] outline-none transition focus:border-[#4e806d] focus:ring-4 focus:ring-[#dce9e0]"
              >
                <option value="">All source accounts</option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold tracking-[0.12em] text-[#657972]">
                TO ACCOUNT
              </span>

              <select
                value={
                  filters.destinationAccountId ?? ''
                }
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    destinationAccountId:
                      event.target.value || undefined,
                    page: 0,
                  }))
                }
                className="w-full cursor-pointer rounded-xl border border-[#d8d5cc] bg-white px-4 py-2.5 pr-10 text-sm text-[#173c32] outline-none transition focus:border-[#4e806d] focus:ring-4 focus:ring-[#dce9e0]"
              >
                <option value="">
                  All destination accounts
                </option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold tracking-[0.12em] text-[#657972]">
                FROM DATE
              </span>

              <input
                type="date"
                value={filters.fromDate ?? ''}
                max={filters.toDate}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    fromDate:
                      event.target.value || undefined,
                    page: 0,
                  }))
                }
                className="w-full cursor-pointer rounded-xl border border-[#d8d5cc] bg-white px-3 py-2.5 text-sm text-[#173c32] outline-none transition focus:border-[#4e806d] focus:ring-4 focus:ring-[#dce9e0]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold tracking-[0.12em] text-[#657972]">
                TO DATE
              </span>

              <input
                type="date"
                value={filters.toDate ?? ''}
                min={filters.fromDate}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    toDate:
                      event.target.value || undefined,
                    page: 0,
                  }))
                }
                className="w-full cursor-pointer rounded-xl border border-[#d8d5cc] bg-white px-3 py-2.5 text-sm text-[#173c32] outline-none transition focus:border-[#4e806d] focus:ring-4 focus:ring-[#dce9e0]"
              />
            </label>
          </div>
        </section>

        <div className="feature-reveal feature-reveal-delay-2 mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              TRANSFER HISTORY
            </p>

            <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
              Recent movement
            </h2>
          </div>

          <button
            type="button"
            disabled={transfersQuery.isFetching}
            onClick={() => void transfersQuery.refetch()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#dedbd2] bg-[#fffdf8] px-4 py-2.5 text-sm font-medium text-[#173c32] transition hover:border-[#8da397] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                transfersQuery.isFetching
                  ? 'animate-spin'
                  : ''
              }
              aria-hidden
            />

            {transfersQuery.isFetching
              ? 'Refreshing…'
              : 'Refresh'}
          </button>
        </div>

        {transfersQuery.isPending && (
          <TransfersSkeleton/>
        )}

        {transfersQuery.error && (
          <section
            role="alert"
            className="feature-reveal feature-reveal-delay-3 mt-6 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-serif text-2xl text-red-950">
              We couldn’t load your transfers
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => void transfersQuery.refetch()}
              className="mt-4 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </section>
        )}

        {page && transfers.length === 0 && (
          <section className="feature-reveal feature-reveal-delay-3 mt-6 rounded-3xl border border-dashed border-[#cfcac0] bg-[#fffdf8] px-6 py-14 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e0ece4] text-[#2d684f]">
              <ArrowRightLeft size={23} aria-hidden/>
            </span>

            <h2 className="mt-5 font-serif text-3xl text-[#173c32]">
              No transfers found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#657972]">
              {filters.status === 'POSTED'
                ? 'Move money between two accounts and your transfer history will appear here.'
                : 'There are no voided transfers matching these filters.'}
            </p>

            {filters.status === 'POSTED' && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216353]"
              >
                <Plus size={17} aria-hidden/>
                Make a transfer
              </button>
            )}
          </section>
        )}

        {transfers.length > 0 && (
          <section className="feature-reveal feature-reveal-delay-3 mt-6 overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
            {transfers.map((transfer, index) => {
              const sourceAccount = accountById.get(
                transfer.sourceAccountId,
              )

              const destinationAccount = accountById.get(
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
                  key={transfer.id}
                  className={`grid gap-5 px-5 py-5 sm:px-7 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center ${
                    index > 0
                      ? 'border-t border-[#e5e1d8]'
                      : ''
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      className={`mt-0.5 grid size-11 shrink-0 place-items-center rounded-full ${
                        transfer.status === 'POSTED'
                          ? 'bg-[#e0ece4] text-[#2d684f]'
                          : 'bg-[#eeeae3] text-[#85786e]'
                      }`}
                    >
                      <ArrowRightLeft
                        size={19}
                        aria-hidden
                      />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-[#173c32]">
                          {sourceAccountName}
                        </p>

                        <ArrowRight
                          size={15}
                          className="shrink-0 text-[#bd8539]"
                          aria-hidden
                        />

                        <p className="truncate font-semibold text-[#173c32]">
                          {destinationAccountName}
                        </p>
                      </div>

                      <p className="mt-1 text-sm text-[#657972]">
                        {formatDate(
                          transfer.transactionDate,
                        )}

                        {transfer.description &&
                          ` · ${transfer.description}`}
                      </p>

                      {transfer.status === 'VOIDED' &&
                        transfer.voidReason && (
                          <p className="mt-2 text-xs text-[#9b705f]">
                            Voided: {transfer.voidReason}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="lg:text-right">
                    <p className="font-serif text-2xl text-[#173c32]">
                      {formatAmount(
                        transfer.amount,
                        sourceAccount?.currencyCode,
                      )}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${
                        transfer.status === 'POSTED'
                          ? 'bg-[#e2eee5] text-[#2d684f]'
                          : 'bg-[#eeeae3] text-[#756a61]'
                      }`}
                    >
                      {transfer.status}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    {transfer.status === 'POSTED' ? (
                      <button
                        type="button"
                        onClick={() =>
                          setTransferToVoid(transfer)
                        }
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e0c9bf] px-4 py-2 text-sm font-semibold text-[#a85e49] transition hover:bg-[#f8ebe6]"
                      >
                        <Ban size={15} aria-hidden/>
                        Void
                      </button>
                    ) : (
                      <span className="text-xs text-[#85786e]">
                        No actions
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </section>
        )}

        {page && page.totalPages > 1 && (
          <nav
            aria-label="Transfer history pages"
            className="feature-reveal feature-reveal-delay-3 mt-6 flex flex-wrap items-center justify-between gap-4"
          >
            <p className="text-sm text-[#657972]">
              Page {page.page + 1} of {page.totalPages}
              {' · '}
              {page.totalElements}{' '}
              {page.totalElements === 1
                ? 'transfer'
                : 'transfers'}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!page.hasPrevious}
                onClick={() =>
                  updatePage(page.page - 1)
                }
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#dedbd2] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#173c32] transition hover:border-[#8da397] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={15} aria-hidden/>
                Previous
              </button>

              <button
                type="button"
                disabled={!page.hasNext}
                onClick={() =>
                  updatePage(page.page + 1)
                }
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#dedbd2] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#173c32] transition hover:border-[#8da397] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={15} aria-hidden/>
              </button>
            </div>
          </nav>
        )}
      </div>

      <TransferModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {transferToVoid && (
        <VoidTransferModal
          transfer={transferToVoid}
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
          onClose={() => setTransferToVoid(null)}
        />
      )}
    </main>
  )
}