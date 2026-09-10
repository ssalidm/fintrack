import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import type {
  ConfirmMfaSetupRequest,
  ConfirmMfaSetupResponse,
  DisableMfaRequest,
  MfaRecoveryCodesResponse,
  MfaSetup,
  MfaStatus,
  RegenerateMfaRecoveryCodesRequest,
} from '../api/types'

export const mfaStatusQueryKey = [
  'profile',
  'mfa-status',
] as const

export function useMfaStatus() {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: mfaStatusQueryKey,
    queryFn: async ({ signal }) => {
      const response = await request<MfaStatus>(
        '/auth/mfa/status',
        { signal },
      )

      return response.data
    },
  })
}

export function useStartMfaSetup() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await request<MfaSetup>(
        '/auth/mfa/setup',
        {
          method: 'POST',
        },
      )

      return response.data
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: mfaStatusQueryKey,
      }),
  })
}

export function useConfirmMfaSetup() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: ConfirmMfaSetupRequest,
    ) => {
      const response =
        await request<ConfirmMfaSetupResponse>(
          '/auth/mfa/setup/confirm',
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: mfaStatusQueryKey,
      }),
  })
}

export function useDisableMfa() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: DisableMfaRequest,
    ) => {
      await request<void>('/auth/mfa/disable', {
        method: 'POST',
        body: payload,
      })
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: mfaStatusQueryKey,
      }),
  })
}

export function useRegenerateMfaRecoveryCodes() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: RegenerateMfaRecoveryCodesRequest,
    ) => {
      const response =
        await request<MfaRecoveryCodesResponse>(
          '/auth/mfa/recovery-codes/regenerate',
          {
            method: 'POST',
            body: payload,
          },
        )

      return response.data
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: mfaStatusQueryKey,
      }),
  })
}