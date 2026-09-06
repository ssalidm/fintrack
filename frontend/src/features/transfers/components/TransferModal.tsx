import {useEffect} from 'react'
import {ArrowLeftRight, X} from 'lucide-react'
import TransferForm from './TransferForm'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TransferModal({
                                        isOpen,
                                        onClose,
                                      }: TransferModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102f28]/55 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-modal-title"
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#d8d5cc] bg-[#fffdf8] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-[#e5e1d8] px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e0ece4] text-[#2d684f]">
              <ArrowLeftRight size={20} aria-hidden/>
            </span>

            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-[#73837d]">
                MOVE MONEY
              </p>

              <h2
                id="transfer-modal-title"
                className="mt-1 font-serif text-3xl tracking-[-0.02em] text-[#173c32]"
              >
                New transfer
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#657972]">
                Move money between two accounts using the same currency.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close transfer form"
            className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#eef1eb] hover:text-[#173c32]"
          >
            <X size={20} aria-hidden/>
          </button>
        </header>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <TransferForm
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </section>
    </div>
  )
}