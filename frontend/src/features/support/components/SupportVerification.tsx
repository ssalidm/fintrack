import { useEffect, useRef, useState } from 'react'

interface TurnstileOptions {
  sitekey: string
  action: string
  theme: 'dark'
  size: 'compact' | 'flexible'
  retry: 'never'
  'response-field': boolean
  'refresh-expired': 'auto'
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => boolean
  'timeout-callback': () => void
}

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: TurnstileOptions,
  ): string | undefined
  remove(widgetId: string): void
}

interface SupportVerificationProps {
  siteKey: string
  onTokenChange: (token: string) => void
}

type VerificationStatus =
  | 'loading'
  | 'ready'
  | 'verified'
  | 'error'

let scriptPromise: Promise<TurnstileApi> | null = null

function getTurnstile() {
  return (
    window as Window & {
      turnstile?: TurnstileApi
    }
  ).turnstile
}

function loadTurnstile(): Promise<TurnstileApi> {
  const existingApi = getTurnstile()

  if (existingApi) {
    return Promise.resolve(existingApi)
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true

    const timeoutId = window.setTimeout(fail, 15000)

    function cleanUp() {
      window.clearTimeout(timeoutId)
      script.onload = null
      script.onerror = null
    }

    function fail() {
      cleanUp()
      script.remove()
      reject(new Error('Security verification could not be loaded.'))
    }

    script.onload = () => {
      const api = getTurnstile()

      if (!api) {
        fail()
        return
      }

      cleanUp()
      resolve(api)
    }

    script.onerror = fail
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    scriptPromise = null
    throw error
  })

  return scriptPromise
}

export default function SupportVerification({
  siteKey,
  onTokenChange,
}: SupportVerificationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] =
    useState<VerificationStatus>('loading')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let widgetId: string | undefined
    let api: TurnstileApi | undefined

    function verificationFailed() {
      if (disposed) return

      onTokenChange('')
      setStatus('error')
    }

    void loadTurnstile()
      .then((loadedApi) => {
        if (disposed) return

        api = loadedApi
        setStatus('ready')

        widgetId = api.render(container, {
          sitekey: siteKey,
          action: 'support_contact',
          theme: 'dark',
          size: container.clientWidth < 300 ? 'compact' : 'flexible',
          retry: 'never',
          'response-field': false,
          'refresh-expired': 'auto',

          callback: (token) => {
            if (disposed) return

            onTokenChange(token)
            setStatus('verified')
          },

          'expired-callback': () => {
            if (disposed) return

            onTokenChange('')
            setStatus('ready')
          },

          'error-callback': () => {
            verificationFailed()
            return true
          },

          'timeout-callback': verificationFailed,
        })

        if (widgetId === undefined) {
          verificationFailed()
        }
      })
      .catch(verificationFailed)

    return () => {
      disposed = true

      if (api && widgetId !== undefined) {
        api.remove(widgetId)
      }
    }
  }, [siteKey, onTokenChange, attempt])

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#edf5f0]">
        Security check
      </p>

      <div ref={containerRef} />

      <p
        role="status"
        className="text-xs leading-6 text-[#c5ddd4]"
      >
        {status === 'loading' && 'Loading security verification…'}
        {status === 'ready' && 'Complete the security check before sending.'}
        {status === 'verified' && 'Security check complete.'}
        {status === 'error' &&
          'The security check could not be completed. Please try again.'}
      </p>

      {status === 'error' && (
        <button
          type="button"
          onClick={() => {
            onTokenChange('')
            setStatus('loading')
            setAttempt((current) => current + 1)
          }}
          className="cursor-pointer text-xs font-semibold text-[#f0cf8d] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Retry security check
        </button>
      )}
    </div>
  )
}