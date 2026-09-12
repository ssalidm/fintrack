const locale = 'en-ZA'

const amountFormatter = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateOnlyFormatter = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const monthFormatter = new Intl.DateTimeFormat(locale, {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatMoney(
  amount: number,
  currencyCode?: string,
  maximumFractionDigits = 2,
): string {
  if (!currencyCode) {
    if (maximumFractionDigits === 2) {
      return amountFormatter.format(amount)
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: Math.min(2, maximumFractionDigits),
      maximumFractionDigits,
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits,
  }).format(amount)
}

// Accepts a calendar date (YYYY-MM-DD), not a timestamp.
export function formatDateOnly(value: string): string {
  return dateOnlyFormatter.format(new Date(`${value}T00:00:00Z`))
}

// Accepts YYYY-MM or a YYYY-MM-DD budget month.
export function formatMonth(value: string): string {
  return monthFormatter.format(
    new Date(`${value.slice(0, 7)}-01T00:00:00Z`),
  )
}