import { useState } from 'react'
import { CircleSlash2 } from 'lucide-react'

import { ApiClientError } from '@/api/ApiClientError'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import type { Transaction } from '@/features/transactions/api/types'
import { useVoidTransaction } from '@/features/transactions/hooks/useTransactions'

interface VoidTransactionModalProps {
  transaction: Transaction
  onClose: () => void
}

export default function VoidTransactionModal({
  transaction,
  onClose,
}: VoidTransactionModalProps) {
  const [reason, setReason] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const voidTransaction = useVoidTransaction()

  async function confirmVoid() {
    if (voidTransaction.isPending) {
      return
    }

    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      setErrorMessage('A reason is required.')
      return
    }

    if (trimmedReason.length > 255) {
      setErrorMessage('Reason must not exceed 255 characters.')
      return
    }

    setErrorMessage(null)

    try {
      await voidTransaction.mutateAsync({
        transactionId: transaction.id,
        payload: {
          version: transaction.version,
          reason: trimmedReason,
        },
      })

      onClose()
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to void this transaction.',
      )
    }
  }

  return (
    <ConfirmationDialog
      title="Void this transaction?"
      description="The transaction will remain in your history but will no longer affect the account balance."
      icon={<CircleSlash2 size={20} aria-hidden />}
      confirmLabel="Void transaction"
      pendingLabel="Voiding…"
      cancelLabel="Cancel"
      isPending={voidTransaction.isPending}
      onConfirm={() => void confirmVoid()}
      onClose={onClose}
      variant="plain"
    >
      <label className="mt-5 block text-sm font-semibold text-[#173c32]">
        Reason
        <textarea
          rows={3}
          maxLength={255}
          value={reason}
          disabled={voidTransaction.isPending}
          onChange={(event) => setReason(event.target.value)}
          className="mt-2 block w-full resize-none rounded-xl border border-[#d8d6ce] bg-white px-4 py-3 font-normal outline-none focus:border-[#9b5845] focus:ring-2 focus:ring-[#9b5845]/15"
          placeholder="Why is this transaction being voided?"
        />
      </label>

      {errorMessage && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
    </ConfirmationDialog>
  )
}