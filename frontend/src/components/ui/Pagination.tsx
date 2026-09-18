import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isFetching?: boolean
  showPageNumbers?: boolean
  label?: string
  summary?: ReactNode
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  isFetching = false,
  showPageNumbers = false,
  label = 'Pagination',
  summary,
}: PaginationProps) {
  if (totalPages < 1) return null

  const lastPage = totalPages - 1
  const visibleCount = Math.min(totalPages, 5)

  const startPage = Math.min(
    Math.max(page - Math.floor(visibleCount / 2), 0),
    totalPages - visibleCount,
  )

  const pageNumbers = Array.from(
    { length: visibleCount },
    (_, index) => startPage + index,
  )

  function changePage(nextPage: number) {
    if (
      isFetching ||
      nextPage === page ||
      nextPage < 0 ||
      nextPage > lastPage
    ) {
      return
    }

    onPageChange(nextPage)
  }

  const buttonClass =
    'inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39725d]'

  const buttonSize = showPageNumbers
    ? 'size-8 sm:size-9'
    : 'gap-1.5 px-3.5 py-2'

  const outlineClass =
    'border border-[#d8d6ce] bg-[#fffdf8] text-[#173c32] enabled:hover:bg-[#efede7]'

  return (
    <nav
      aria-label={label}
      aria-busy={isFetching}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p
        className="text-xs text-[#657972]"
        aria-live="polite"
        aria-atomic="true"
      >
        {summary ??
          (page >= 0 && page <= lastPage
            ? `Page ${page + 1} of ${totalPages}`
            : 'Choose an available page')}
      </p>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          title="Previous page"
          disabled={isFetching || page <= 0}
          onClick={() => changePage(Math.min(page - 1, lastPage))}
          className={`${buttonClass} ${buttonSize} ${outlineClass}`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {!showPageNumbers && 'Previous'}
        </button>

        {showPageNumbers &&
          pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              aria-label={`Page ${pageNumber + 1}`}
              aria-current={pageNumber === page ? 'page' : undefined}
              disabled={isFetching}
              onClick={() => changePage(pageNumber)}
              className={`${buttonClass} ${buttonSize} ${
                pageNumber === page
                  ? 'bg-[#174f43] text-white'
                  : 'text-[#657972] enabled:hover:bg-[#efede7] enabled:hover:text-[#173c32]'
              }`}
            >
              {pageNumber + 1}
            </button>
          ))}

        <button
          type="button"
          aria-label="Next page"
          title="Next page"
          disabled={isFetching || page >= lastPage}
          onClick={() => changePage(Math.max(page + 1, 0))}
          className={`${buttonClass} ${buttonSize} ${
            showPageNumbers
              ? outlineClass
              : 'bg-[#174f43] text-white enabled:hover:bg-[#236a58]'
          }`}
        >
          {!showPageNumbers && 'Next'}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}