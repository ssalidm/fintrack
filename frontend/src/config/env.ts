function requireHttpUrl(name: string, value: string | undefined): string {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(normalizedValue)
  } catch {
    throw new Error(`${name} must be a valid URL`)
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(`${name} must use HTTP or HTTPS`)
  }

  return parsedUrl.toString().replace(/\/$/, '')
}

export const env = Object.freeze({
  apiBaseUrl: requireHttpUrl(
    'VITE_API_BASE_URL',
    import.meta.env.VITE_API_BASE_URL,
  ),
})
