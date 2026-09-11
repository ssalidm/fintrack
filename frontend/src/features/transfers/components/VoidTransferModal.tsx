import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'
import {Ban, X} from 'lucide-react'
import {ApiClientError} from '../../../api/ApiClientError'
import type {Transfer} from '../api/types'
import {useVoidTransfer} from '../hooks/useTransfers'

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
  const [reason, setReason] = useState('')
  const voidTransfer = useVoidTransfer()

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (
        event.key === 'Escape' &&
        !voidTransfer.isPending
      ) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, voidTransfer.isPending])

  const trimmedReason = reason.trim()

  const errorMessage =
    voidTransfer.error instanceof ApiClientError
      ? voidTransfer.error.message
      : voidTransfer.error
        ? 'The transfer could not be voided.'
        : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      trimmedReason.length === 0 ||
      trimmedReason.length > 255
    ) {
      return
    }

    await voidTransfer.mutateAsync({
      transferId: transfer.id,
      payload: {
        version: transfer.version,
        reason: trimmedReason,
      },
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102f28]/55 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={() => {
        if (!voidTransfer.isPending) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="void-transfer-title"
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#e1d6ce] bg-[#fffdf8] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-[#eadfd7] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f5e7e1] text-[#a85e49]">
              <Ban size={20} aria-hidden/>
            </span>

            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-[#9b705f]">
                REVERSE MOVEMENT
              </p>

              <h2
                id="void-transfer-title"
                className="mt-1 font-serif text-3xl tracking-[-0.02em] text-[#173c32]"
              >
                Void transfer?
              </h2>
            </div>
          </div>

          <button
            type="button"
            disabled={voidTransfer.isPending}
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#eef1eb] hover:text-[#173c32] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} aria-hidden/>
          </button>
        </header>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="px-6 py-6 sm:px-8"
        >
          <p className="text-sm leading-6 text-[#657972]">
            This will reverse the movement from{' '}
            <strong className="font-semibold text-[#173c32]">
              {sourceAccountName}
            </strong>{' '}
            to{' '}
            <strong className="font-semibold text-[#173c32]">
              {destinationAccountName}
            </strong>
            . The original transfer will remain visible in your history.
          </p>

          <label
            htmlFor="void-transfer-reason"
            className="mt-6 block text-sm font-semibold text-[#173c32]"
          >
            Reason
          </label>

          <textarea
            id="void-transfer-reason"
            value={reason}
            maxLength={255}
            rows={4}
            disabled={voidTransfer.isPending}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why is this transfer being voided?"
            className="mt-2 w-full resize-none rounded-2xl border border-[#d8d5cc] bg-white px-4 py-3 text-sm text-[#173c32] outline-none transition placeholder:text-[#98a39f] focus:border-[#4e806d] focus:ring-4 focus:ring-[#dce9e0] disabled:bg-[#f2f0ea]"
          />

          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-[#a85e49]">
              {reason.length > 0 && trimmedReason.length === 0
                ? 'Enter a meaningful reason.'
                : ''}
            </span>

            <span className="text-[#7b8984]">
              {reason.length}/255
            </span>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={voidTransfer.isPending}
              onClick={onClose}
              className="cursor-pointer rounded-full border border-[#d8d5cc] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:border-[#8da397] hover:bg-[#f5f5ef] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep transfer
            </button>

            <button
              type="submit"
              disabled={
                voidTransfer.isPending ||
                trimmedReason.length === 0 ||
                trimmedReason.length > 255
              }
              className="cursor-pointer rounded-full bg-[#a85e49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#914d3c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {voidTransfer.isPending
                ? 'Voiding…'
                : 'Void transfer'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}