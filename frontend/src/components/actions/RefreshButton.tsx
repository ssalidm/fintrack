import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
  isRefreshing: boolean
  onRefresh: () => void | Promise<unknown>
  label?: string
  iconOnly?: boolean
}

export default function RefreshButton({
  isRefreshing,
  onRefresh,
  label = 'Refresh',
  iconOnly = false,
}: RefreshButtonProps) {
  return (
    <button
      type="button"
      disabled={isRefreshing}
      onClick={() => void onRefresh()}
      aria-label={label}
      title={iconOnly ? label : undefined}
      className={
        iconOnly
          ? 'grid size-11 cursor-pointer place-items-center rounded-full border border-[#d8d6ce] bg-[#fffdf8] text-[#657972] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:cursor-not-allowed disabled:opacity-60'
          : 'inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d6ce] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#173c32] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      <RefreshCw
        size={iconOnly ? 18 : 16}
        aria-hidden
        className={
          isRefreshing
            ? 'animate-spin'
            : ''
        }
      />

      {!iconOnly && (
        <span>
          {isRefreshing
            ? 'Refreshing…'
            : label}
        </span>
      )}
    </button>
  )
}