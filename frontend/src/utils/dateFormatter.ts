export function formatDate(
  value: string | null,
  time?: boolean | null,
) {
  if (!value) {
    return 'Not available'
  }

  const dateTime: Intl.DateTimeFormatOptions = time
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }

  return new Intl.DateTimeFormat(
    'en-ZA',
    dateTime,
  ).format(new Date(value))
}