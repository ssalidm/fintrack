import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Account } from '../api/types'
import AccountForm from './AccountForm'

interface AccountModalProps {
  account?: Account
  onClose: () => void
}

export default function AccountModal({
                                       account,
                                       onClose,
                                     }: AccountModalProps) {
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

  const title = account ? 'Edit account' : 'Add an account'

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-[#102e27]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close account form"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-[#f7f5ef] p-6 shadow-2xl sm:p-9"
      >
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              {account ? 'ACCOUNT DETAILS' : 'A NEW BEGINNING'}
            </p>

            <h2
              id="account-modal-title"
              className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#173c32]"
            >
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#657972]">
              {account
                ? 'Update how this account appears and contributes to your financial picture.'
                : 'Tell Salif where this money lives.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#ebe9e3] hover:text-[#173c32]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="mt-9">
          <AccountForm
            account={account}
            onCancel={onClose}
            onSuccess={onClose}
          />
        </div>
      </section>
    </div>
  )
}
