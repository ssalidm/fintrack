import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Transaction } from '../api/types'
import TransactionForm from './TransactionForm'

interface TransactionModalProps {
  transaction?: Transaction
  onClose: () => void
}

export default function TransactionModal({
                                           transaction,
                                           onClose,
                                         }: TransactionModalProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-[#102e27]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close transaction form"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-[#f7f5ef] p-6 shadow-2xl sm:p-9"
      >
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              {transaction ? 'MONEY MOVEMENT' : 'A NEW ENTRY'}
            </p>

            <h2
              id="transaction-modal-title"
              className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#173c32]"
            >
              {transaction
                ? 'Edit transaction'
                : 'Record a transaction'}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#657972]">
              Keep your financial picture accurate and current.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8d6ce] p-2 text-[#657972] hover:bg-[#ebe9e3] hover:text-[#173c32]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="mt-9">
          <TransactionForm
            transaction={transaction}
            onCancel={onClose}
            onSuccess={onClose}
          />
        </div>
      </section>
    </div>
  )
}
