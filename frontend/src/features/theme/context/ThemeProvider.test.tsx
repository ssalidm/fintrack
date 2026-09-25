import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  THEME_STORAGE_KEY,
} from '@/features/theme/themePreference'
import ThemeProvider from './ThemeProvider'
import { useTheme } from './useTheme'

type MediaChangeListener =
  (
    event: MediaQueryListEvent,
  ) => void

function installMatchMedia(
  initialMatches = false,
) {
  let matches =
    initialMatches

  const listeners =
    new Set<MediaChangeListener>()

  const mediaQueryList = {
    get matches() {
      return matches
    },

    media:
      '(prefers-color-scheme: dark)',

    onchange: null,

    addEventListener: vi.fn(
      (
        type: string,
        listener:
          EventListenerOrEventListenerObject,
      ) => {
        if (
          type === 'change' &&
          typeof listener === 'function'
        ) {
          listeners.add(
            listener as MediaChangeListener,
          )
        }
      },
    ),

    removeEventListener: vi.fn(
      (
        type: string,
        listener:
          EventListenerOrEventListenerObject,
      ) => {
        if (
          type === 'change' &&
          typeof listener === 'function'
        ) {
          listeners.delete(
            listener as MediaChangeListener,
          )
        }
      },
    ),

    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList

  Object.defineProperty(
    window,
    'matchMedia',
    {
      configurable: true,

      value: vi.fn(
        () =>
          mediaQueryList,
      ),
    },
  )

  return {
    setMatches(
      nextMatches: boolean,
    ) {
      matches =
        nextMatches

      const event = {
        matches:
          nextMatches,

        media:
          '(prefers-color-scheme: dark)',
      } as MediaQueryListEvent

      listeners.forEach(
        (listener) =>
          listener(event),
      )
    },
  }
}

function ThemeConsumer() {
  const {
    preference,
    resolvedTheme,
    setPreference,
    toggleTheme,
  } =
    useTheme()

  return (
    <div>
      <span data-testid="preference">
        {preference}
      </span>

      <span data-testid="resolved-theme">
        {resolvedTheme}
      </span>

      <button
        type="button"
        onClick={() =>
          setPreference('light')
        }
      >
        Use light
      </button>

      <button
        type="button"
        onClick={() =>
          setPreference('dark')
        }
      >
        Use dark
      </button>

      <button
        type="button"
        onClick={() =>
          setPreference('system')
        }
      >
        Use system
      </button>

      <button
        type="button"
        onClick={
          toggleTheme
        }
      >
        Toggle theme
      </button>
    </div>
  )
}

function renderProvider() {
  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  )
}

describe(
  'ThemeProvider',
  () => {
    beforeEach(() => {
      window.localStorage.clear()

      delete document
        .documentElement
        .dataset
        .theme

      document
        .documentElement
        .style
        .colorScheme = ''

      installMatchMedia(false)
    })

    it(
      'uses the system preference by default',
      async () => {
        renderProvider()

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'system',
        )

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'light',
        )

        await waitFor(
          () => {
            expect(
              document
                .documentElement
                .dataset
                .theme,
            ).toBe('light')
          },
        )

        expect(
          window.localStorage
            .getItem(
              THEME_STORAGE_KEY,
            ),
        ).toBe('system')
      },
    )

    it(
      'restores a saved dark preference',
      async () => {
        window.localStorage
          .setItem(
            THEME_STORAGE_KEY,
            'dark',
          )

        renderProvider()

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'dark',
        )

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'dark',
        )

        await waitFor(
          () => {
            expect(
              document
                .documentElement
                .dataset
                .theme,
            ).toBe('dark')
          },
        )

        expect(
          document
            .documentElement
            .style
            .colorScheme,
        ).toBe('dark')
      },
    )

    it(
      'persists an explicitly selected theme',
      async () => {
        const user =
          userEvent.setup()

        renderProvider()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Use dark',
            },
          ),
        )

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'dark',
        )

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'dark',
        )

        await waitFor(
          () => {
            expect(
              window.localStorage
                .getItem(
                  THEME_STORAGE_KEY,
                ),
            ).toBe('dark')
          },
        )

        expect(
          document
            .documentElement
            .dataset
            .theme,
        ).toBe('dark')
      },
    )

    it(
      'follows system theme changes while using the system preference',
      async () => {
        const matchMedia =
          installMatchMedia(
            false,
          )

        renderProvider()

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'light',
        )

        matchMedia.setMatches(
          true,
        )

        await waitFor(
          () => {
            expect(
              screen.getByTestId(
                'resolved-theme',
              ),
            ).toHaveTextContent(
              'dark',
            )
          },
        )

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'system',
        )

        expect(
          document
            .documentElement
            .dataset
            .theme,
        ).toBe('dark')
      },
    )

    it(
      'does not let system changes override an explicit preference',
      async () => {
        const matchMedia =
          installMatchMedia(
            false,
          )

        const user =
          userEvent.setup()

        renderProvider()

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Use light',
            },
          ),
        )

        matchMedia.setMatches(
          true,
        )

        await waitFor(
          () => {
            expect(
              screen.getByTestId(
                'resolved-theme',
              ),
            ).toHaveTextContent(
              'light',
            )
          },
        )

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'light',
        )

        expect(
          document
            .documentElement
            .dataset
            .theme,
        ).toBe('light')
      },
    )

    it(
      'toggles from the currently resolved theme',
      async () => {
        const user =
          userEvent.setup()

        renderProvider()

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'light',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Toggle theme',
            },
          ),
        )

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'dark',
        )

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'dark',
        )

        await user.click(
          screen.getByRole(
            'button',
            {
              name:
                'Toggle theme',
            },
          ),
        )

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'light',
        )

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'light',
        )
      },
    )

    it(
      'falls back to system when stored preference is invalid',
      () => {
        window.localStorage
          .setItem(
            THEME_STORAGE_KEY,
            'invalid-theme',
          )

        renderProvider()

        expect(
          screen.getByTestId(
            'preference',
          ),
        ).toHaveTextContent(
          'system',
        )

        expect(
          screen.getByTestId(
            'resolved-theme',
          ),
        ).toHaveTextContent(
          'light',
        )
      },
    )
  },
)