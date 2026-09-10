import {
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import TwoFactorAuthenticationCard from './TwoFactorAuthenticationCard'

const mocks = vi.hoisted(() => ({
  status: vi.fn(),
  startSetup: vi.fn(),
  confirmSetup: vi.fn(),
  disableMfa: vi.fn(),
  regenerateCodes: vi.fn(),
  refetch: vi.fn(),
}))

vi.mock(
  '../hooks/useMfaManagement',
  () => ({
    useMfaStatus: () => mocks.status(),
    useStartMfaSetup: () => ({
      isPending: false,
      mutateAsync: mocks.startSetup,
    }),
    useConfirmMfaSetup: () => ({
      isPending: false,
      mutateAsync: mocks.confirmSetup,
    }),
    useDisableMfa: () => ({
      isPending: false,
      mutateAsync: mocks.disableMfa,
    }),
    useRegenerateMfaRecoveryCodes:
      () => ({
        isPending: false,
        mutateAsync:
          mocks.regenerateCodes,
      }),
  }),
)

function disabledStatus() {
  mocks.status.mockReturnValue({
    data: {
      enabled: false,
      setupPending: false,
      enabledAt: null,
      remainingRecoveryCodes: 0,
    },
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
  })
}

function enabledStatus() {
  mocks.status.mockReturnValue({
    data: {
      enabled: true,
      setupPending: false,
      enabledAt:
        '2026-09-10T10:00:00Z',
      remainingRecoveryCodes: 7,
    },
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
  })
}

describe(
  'TwoFactorAuthenticationCard',
  () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it(
      'starts setup and opens the authenticator dialog',
      async () => {
        const user = userEvent.setup()

        disabledStatus()

        mocks.startSetup.mockResolvedValue({
          manualEntryKey: 'ABC123',
          otpAuthUri:
            'otpauth://totp/Salif:test',
        })

        render(
          <TwoFactorAuthenticationCard />,
        )

        await user.click(
          screen.getByRole('button', {
            name: 'Set up now',
          }),
        )

        expect(
          mocks.startSetup,
        ).toHaveBeenCalledOnce()

        expect(
          await screen.findByRole(
            'heading',
            {
              name: 'Connect your authenticator',
            },
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'shows enabled status and remaining recovery codes',
      () => {
        enabledStatus()

        render(
          <TwoFactorAuthenticationCard />,
        )

        expect(
          screen.getByText('Enabled'),
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            '7 recovery codes left',
          ),
        ).toBeInTheDocument()
      },
    )

    it(
      'opens the disable confirmation dialog',
      async () => {
        const user = userEvent.setup()

        enabledStatus()

        render(
          <TwoFactorAuthenticationCard />,
        )

        await user.click(
          screen.getByRole('button', {
            name: 'Disable',
          }),
        )

        expect(
          screen.getByRole('heading', {
            name: 'Disable two-factor authentication?',
          }),
        ).toBeInTheDocument()
      },
    )
  },
)