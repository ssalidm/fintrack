import {
  useId,
  useState,
} from 'react'
import { Ban } from 'lucide-react'

import { ApiClientError } from '@/api/ApiClientError'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import type { Transfer } from '@/features/transfers/api/types'
import { useVoidTransfer } from '@/features/transfers/hooks/useTransfers'

interface VoidTransferModalProps {
  transfer: Transfer
  sourceAccountName: string
  destinationAccountName: string
  onClose: () => void
}

export default function VoidTransferModal({
  transfer,
  sourceAccountName,
  destinationAccountName,
  onClose,
}: VoidTransferModalProps) {
  const [
    reason,
    setReason,
  ] = useState('')

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(
    null,
  )

  const voidTransfer =
    useVoidTransfer()

  const reasonId = useId()

  const trimmedReason =
    reason.trim()

  const errorMessage =
    voidTransfer.error instanceof
    ApiClientError
      ? voidTransfer.error
          .message
      : voidTransfer.error
        ? 'The transfer could not be voided.'
        : validationError

  function confirmVoid() {
    if (
      voidTransfer.isPending
    ) {
      return
    }

    if (
      trimmedReason.length === 0
    ) {
      setValidationError(
        'A reason is required.',
      )
      return
    }

    if (
      trimmedReason.length > 255
    ) {
      setValidationError(
        'Reason must not exceed 255 characters.',
      )
      return
    }

    setValidationError(null)

    voidTransfer.mutate(
      {
        transferId:
          transfer.id,
        payload: {
          version:
            transfer.version,
          reason:
            trimmedReason,
        },
      },
      {
        onSuccess:
          onClose,
      },
    )
  }

  return (
    <ConfirmationDialog
      title="Void transfer?"
      description={
        <>
          This will reverse the
          movement from{' '}
          <strong className="font-semibold text-ink">
            {sourceAccountName}
          </strong>{' '}
          to{' '}
          <strong className="font-semibold text-ink">
            {
              destinationAccountName
            }
          </strong>
          . The original transfer
          will remain visible in
          your history.
        </>
      }
      icon={
        <Ban
          size={18}
          aria-hidden
        />
      }
      confirmLabel="Void transfer"
      pendingLabel="Voiding…"
      cancelLabel="Keep transfer"
      isPending={
        voidTransfer.isPending
      }
      onConfirm={confirmVoid}
      onClose={onClose}
      variant="plain"
    >
      <label
        htmlFor={reasonId}
        className="mt-6 block text-sm font-semibold text-ink"
      >
        Reason
      </label>

      <textarea
        id={reasonId}
        value={reason}
        maxLength={255}
        rows={4}
        disabled={
          voidTransfer.isPending
        }
        onChange={(event) => {
          setReason(
            event.target.value,
          )
          setValidationError(
            null,
          )
        }}
        placeholder="Why is this transfer being voided?"
        className="mt-2 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:bg-surface-muted"
      />

      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-danger">
          {reason.length > 0 &&
          trimmedReason.length === 0
            ? 'Enter a meaningful reason.'
            : ''}
        </span>

        <span className="text-subtle">
          {reason.length}/255
        </span>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {errorMessage}
        </div>
      )}
    </ConfirmationDialog>
  )
}
