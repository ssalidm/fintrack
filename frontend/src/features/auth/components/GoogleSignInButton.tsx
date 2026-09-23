import {
  useCallback,
  useEffect,
  useRef,
} from 'react'

import { env } from '../../../config/env'

interface GoogleCredentialResponse {
  readonly credential?: string
}

type GoogleButtonText =
  | 'signin_with'
  | 'signup_with'
  | 'continue_with'

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
      shape: 'pill'
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

interface GoogleSignInButtonProps {
  readonly disabled?: boolean
  readonly text?: GoogleButtonText

  readonly onCredential: (
    credential: string,
  ) => void | Promise<void>

  readonly onError?: (
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
    (window as GoogleWindow)
      .google

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
  text = 'continue_with',
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const containerRef =
    useRef<HTMLDivElement>(null)

  const hasRenderedRef =
    useRef(false)

  const renderGoogleButton =
    useCallback(() => {
      const container =
        containerRef.current

      const google =
        (window as GoogleWindow)
          .google

      if (
        !container ||
        !google ||
        hasRenderedRef.current
      ) {
        return
      }

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

      google.accounts.id.renderButton(
        container,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'left',
          width,
        },
      )

      hasRenderedRef.current =
        true
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
  >
    <div className="relative h-[40px] w-full overflow-hidden rounded-full">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full"
      />
    </div>
  </div>
)
}