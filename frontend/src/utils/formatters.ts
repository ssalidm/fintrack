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

export function formatMoney(
  amount: number,
  currencyCode?: string,
): string {
  if (!currencyCode) {
    return amountFormatter.format(amount)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Accepts a calendar date (YYYY-MM-DD), not a timestamp.
// Parsing and formatting in UTC preserves the date in every viewer's time zone.
export function formatDateOnly(value: string): string {
  return dateOnlyFormatter.format(new Date(`${value}T00:00:00Z`))
}