import {
  act,
  render,
  waitFor,
} from '@testing-library/react'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  ThemeContext,
  type ThemeContextValue,
} from '@/features/theme/context/ThemeContext'
import type {
  ResolvedTheme,
} from '@/features/theme/themePreference'

import GoogleSignInButton from './GoogleSignInButton'

vi.mock(
  '@/config/env',
  () => ({
    env: {
      apiBaseUrl:
        'http://localhost:8080/api/v1',
      googleClientId:
        'test-google-client-id',
    },
  }),
)

interface GoogleCredentialResponse {
  readonly credential?: string
}

interface GoogleInitializeOptions {
  readonly client_id: string
  readonly auto_select?: boolean
  readonly callback: (
    response: GoogleCredentialResponse,
  ) => void
}

interface GoogleRenderButtonOptions {
  readonly type: 'standard'
  readonly theme:
  | 'outline'
  | 'outline_dark'
  readonly size: 'large'
  readonly text:
  | 'signin_with'
  | 'signup_with'
  | 'continue_with'
  readonly shape: 'pill'
  readonly logo_alignment: 'left'
  readonly width: number
}

interface GoogleIdentityApi {
  initialize: (
    options: GoogleInitializeOptions,
  ) => void

  renderButton: (
    parent: HTMLElement,
    options: GoogleRenderButtonOptions,
  ) => void

  disableAutoSelect: () => void
}

type GoogleWindow =
  Window & {
    google?: {
      accounts: {
        id: GoogleIdentityApi
      }
    }
  }

const initializeMock =
  vi.fn<
    (
      options:
        GoogleInitializeOptions,
    ) => void
  >()

const renderButtonMock =
  vi.fn<
    (
      parent: HTMLElement,
      options:
        GoogleRenderButtonOptions,
    ) => void
  >()

const disableAutoSelectMock =
  vi.fn()

function themeContextValue(
  resolvedTheme: ResolvedTheme,
): ThemeContextValue {
  return {
    preference:
      resolvedTheme,

    resolvedTheme,

    setPreference:
      vi.fn(),

    toggleTheme:
      vi.fn(),
  }
}

function renderGoogleButton(
  resolvedTheme: ResolvedTheme,
  onCredential:
    (credential: string) => void,
  onError:
    (message: string) => void,
) {
  return render(
    <ThemeContext.Provider
      value={
        themeContextValue(
          resolvedTheme,
        )
      }
    >
      <GoogleSignInButton
        text="signin_with"
        onCredential={onCredential}
        onError={onError}
      />
    </ThemeContext.Provider>,
  )
}

describe('GoogleSignInButton',
  () => {
    beforeEach(() => {
      initializeMock.mockReset()
      renderButtonMock.mockReset()
      disableAutoSelectMock.mockReset()

      Object.defineProperty(
        HTMLElement.prototype,
        'clientWidth',
        {
          configurable: true,
          get: () => 320,
        },
      )

      const googleWindow =
        window as GoogleWindow

      googleWindow.google = {
        accounts: {
          id: {
            initialize:
              initializeMock,

            renderButton:
              renderButtonMock,

            disableAutoSelect:
              disableAutoSelectMock,
          },
        },
      }
    })

    it(
      'reports Google initialization failures',
      async () => {
        const onCredential = vi.fn()

        const onError = vi.fn()

        initializeMock
          .mockImplementation(
            () => {
              throw new Error(
                'Google initialization failed',
              )
            },
          )

        renderGoogleButton(
          'light',
          onCredential,
          onError,
        )

        await waitFor(
          () => {
            expect(
              onError,
            ).toHaveBeenCalledWith(
              'Google initialization failed',
            )
          },
        )

        expect(
          renderButtonMock,
        ).not.toHaveBeenCalled()

        expect(
          onCredential,
        ).not.toHaveBeenCalled()
      },
    )

    it(
      'renders the Google button for the active theme and forwards credentials',
      async () => {
        const onCredential = vi.fn()

        const onError = vi.fn()

        let credentialCallback:
          | ((
            response:
              GoogleCredentialResponse,
          ) => void)
          | undefined

        initializeMock
          .mockImplementation(
            (
              options,
            ) => {
              credentialCallback =
                options.callback
            },
          )

        const {
          rerender,
        } =
          renderGoogleButton(
            'light',
            onCredential,
            onError,
          )

        await waitFor(
          () => {
            expect(
              initializeMock,
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                client_id: 'test-google-client-id',
                auto_select: false,
              }),
            )
          },
        )

        await waitFor(
          () => {
            expect(
              renderButtonMock,
            ).toHaveBeenCalledWith(
              expect.any(
                HTMLElement,
              ),

              expect.objectContaining({
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'pill',
                logo_alignment: 'left',
                width: 320,
              }),
            )
          },
        )

        expect(
          credentialCallback,
        ).toBeDefined()

        act(() => {
          credentialCallback?.({
            credential: 'google-id-token',
          })
        })

        expect(
          onCredential,
        ).toHaveBeenCalledTimes(1,)

        expect(
          onCredential,
        ).toHaveBeenCalledWith('google-id-token',)

        rerender(
          <ThemeContext.Provider
            value={
              themeContextValue('dark',)
            }
          >
            <GoogleSignInButton
              text="signin_with"
              onCredential={onCredential}
              onError={onError}
            />
          </ThemeContext.Provider>,
        )

        await waitFor(
          () => {
            expect(
              renderButtonMock,
            ).toHaveBeenLastCalledWith(
              expect.any(
                HTMLElement,
              ),

              expect.objectContaining({
                theme: 'outline_dark',
              }),
            )
          },
        )

        expect(
          onError,
        ).not.toHaveBeenCalled()
      },
    )
  },
)