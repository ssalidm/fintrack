import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { env } from '../../../config/env'

interface GoogleCredentialResponse {
  readonly credential?: string
}

interface GoogleIdentityApi {
  initialize(options: {
    client_id: string
    auto_select?: boolean
    callback: (
      response: GoogleCredentialResponse,
    ) => void
  }): void

  renderButton(
    parent: HTMLElement,
    options: {
      type: 'standard'
      theme: 'outline'
      size: 'large'
      text: GoogleButtonText
      shape: 'rectangular'
      logo_alignment: 'left'
      width: number
    },
  ): void

  disableAutoSelect(): void
}

interface GoogleApi {
  accounts: {
    id: GoogleIdentityApi
  }
}

type GoogleWindow = Window & {
  google?: GoogleApi
}

type GoogleButtonText =
  | 'signin_with'
  | 'signup_with'
  | 'continue_with'

interface GoogleSignInButtonProps {
  disabled?: boolean
  text?: GoogleButtonText

  onCredential: (
    credential: string,
  ) => void | Promise<void>

  onError?: (
    message: string,
  ) => void
}

let googleScriptPromise:
  Promise<void> | null = null

let initializedClientId:
  string | null = null

let credentialHandler:
  | ((
      credential: string,
    ) => void | Promise<void>)
  | null = null


function loadGoogleScript():
  Promise<void> {

  const googleWindow =
    window as GoogleWindow

  if (googleWindow.google) {
    return Promise.resolve()
  }

  if (googleScriptPromise) {
    return googleScriptPromise
  }

  googleScriptPromise =
    new Promise(
      (resolve, reject) => {

        const existing =
          document.getElementById(
            'google-identity-services',
          ) as HTMLScriptElement | null

        if (existing) {
          existing.addEventListener(
            'load',
            () => resolve(),
            {
              once: true,
            },
          )

          existing.addEventListener(
            'error',
            () =>
              reject(
                new Error(
                  'Could not load Google Identity Services.',
                ),
              ),
            {
              once: true,
            },
          )

          return
        }

        const script =
          document.createElement(
            'script',
          )

        script.id =
          'google-identity-services'

        script.src =
          'https://accounts.google.com/gsi/client'

        script.async = true
        script.defer = true

        script.onload =
          () => resolve()

        script.onerror =
          () =>
            reject(
              new Error(
                'Could not load Google Identity Services.',
              ),
            )

        document.head.appendChild(
          script,
        )
      },
    )

  return googleScriptPromise
}


function initializeGoogle(
  clientId: string,
) {
  const google =
    (
      window as GoogleWindow
    ).google

  if (!google) {
    throw new Error(
      'Google Identity Services is unavailable.',
    )
  }

  if (
    initializedClientId ===
    clientId
  ) {
    return
  }

  google.accounts.id.initialize({
    client_id: clientId,
    auto_select: false,

    callback: (
      response,
    ) => {
      if (
        response.credential &&
        credentialHandler
      ) {
        void credentialHandler(
          response.credential,
        )
      }
    },
  })

  initializedClientId =
    clientId
}


export default function GoogleSignInButton({
  disabled = false,
  text = 'signin_with',
  onCredential,
  onError,
}: GoogleSignInButtonProps) {

  const containerRef =
    useRef<HTMLDivElement>(null)

  const [ready, setReady] =
    useState(false)

  const renderGoogleButton =
    useCallback(() => {

      const container =
        containerRef.current

      const google =
        (
          window as GoogleWindow
        ).google

      if (
        !container ||
        !google
      ) {
        return
      }

      /*
       * Google's standard button supports
       * a maximum width of 400px.
       */
      const width =
        Math.min(
          Math.floor(
            container.clientWidth,
          ),
          400,
        )

      if (width <= 0) {
        return
      }

      container.innerHTML =
        ''

      google.accounts.id.renderButton(
        container,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width,
        },
      )

      setReady(true)
    }, [text])


  useEffect(() => {
    const clientId =
      env.googleClientId

    if (!clientId) {
      return
    }

    credentialHandler =
      onCredential

    let cancelled = false
    let resizeObserver:
      ResizeObserver | null = null

    async function initialize() {
      try {
        await loadGoogleScript()

        if (cancelled) {
          return
        }

        initializeGoogle(
          clientId!,
        )

        renderGoogleButton()

        if (
          containerRef.current
        ) {
          resizeObserver =
            new ResizeObserver(
              () => {
                renderGoogleButton()
              },
            )

          resizeObserver.observe(
            containerRef.current,
          )
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        onError?.(
          error instanceof Error
            ? error.message
            : 'Google sign-in could not be initialized.',
        )
      }
    }

    void initialize()

    return () => {
      cancelled = true

      resizeObserver?.disconnect()

      if (
        credentialHandler ===
        onCredential
      ) {
        credentialHandler =
          null
      }
    }
  }, [
    onCredential,
    onError,
    renderGoogleButton,
  ])


  if (!env.googleClientId) {
    return null
  }


  return (
    <div
      className={
        disabled
          ? 'pointer-events-none w-full opacity-60'
          : 'w-full'
      }
      aria-busy={
        !ready || disabled
      }
    >
      <div
        ref={containerRef}
        className="flex min-h-11 w-full justify-center"
      />

      {!ready && (
        <p className="mt-2 text-center text-xs text-[#657972]">
          Loading Google sign-in…
        </p>
      )}
    </div>
  )
}