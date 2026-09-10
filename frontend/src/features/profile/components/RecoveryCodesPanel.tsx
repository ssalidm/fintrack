import {
  Check,
  Copy,
  Download,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'

interface RecoveryCodesPanelProps {
  codes: readonly string[]
  onDone: () => void
  completionLabel?: string
}

type CopyStatus =
  | 'idle'
  | 'copied'
  | 'failed'

export default function RecoveryCodesPanel({
  codes,
  onDone,
  completionLabel = 'Done',
}: RecoveryCodesPanelProps) {
  const [copyStatus, setCopyStatus] =
    useState<CopyStatus>('idle')

  const [codesSaved, setCodesSaved] =
    useState(false)

  const codesText = codes.join('\n')

  async function copyCodes() {
    try {
      if (!navigator.clipboard) {
        throw new Error(
          'Clipboard access is unavailable',
        )
      }

      await navigator.clipboard.writeText(
        codesText,
      )

      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  function downloadCodes() {
    const contents = [
      'Salif two-factor authentication recovery codes',
      '',
      'Keep these codes somewhere safe.',
      'Each code can only be used once.',
      '',
      codesText,
      '',
    ].join('\n')

    const file = new Blob([contents], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(file)
    const link = document.createElement('a')

    link.href = url
    link.download = 'salif-recovery-codes.txt'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <span className="grid size-12 place-items-center rounded-2xl bg-[#e0eee8] text-[#1F7A5C]">
        <ShieldCheck size={23} aria-hidden />
      </span>

      <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-[#1F7A5C]">
        KEEP THESE SAFE
      </p>

      <h2 className="mt-3 font-serif text-3xl text-[#173c32]">
        Save your recovery codes
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#657972]">
        These codes are your way back into
        Salif if you lose access to your
        authenticator app. Each code can only
        be used once, and they will not be
        shown again.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-[#d8ddd6] bg-[#f7f8f4] p-4 sm:grid-cols-3">
        {codes.map((code, index) => (
          <div
            key={code}
            className="rounded-lg bg-white px-3 py-2.5 text-center font-mono text-sm font-semibold tracking-wide text-[#294e43] shadow-sm"
          >
            <span className="sr-only">
              Recovery code {index + 1}:
            </span>

            {code}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={copyCodes}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#cfd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#294e43] transition hover:border-[#1F7A5C] hover:bg-[#f7faf7]"
        >
          {copyStatus === 'copied' ? (
            <Check size={16} aria-hidden />
          ) : (
            <Copy size={16} aria-hidden />
          )}

          {copyStatus === 'copied'
            ? 'Copied'
            : 'Copy all codes'}
        </button>

        <button
          type="button"
          onClick={downloadCodes}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#cfd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#294e43] transition hover:border-[#1F7A5C] hover:bg-[#f7faf7]"
        >
          <Download size={16} aria-hidden />
          Download codes
        </button>
      </div>

      <p
        className={`mt-3 min-h-5 text-sm ${
          copyStatus === 'failed'
            ? 'text-red-600'
            : 'text-[#4f806f]'
        }`}
        aria-live="polite"
      >
        {copyStatus === 'failed'
          ? 'Unable to copy automatically. Download the codes instead.'
          : copyStatus === 'copied'
            ? 'All recovery codes copied.'
            : ''}
      </p>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-[#edf3ed] px-4 py-3">
        <input
          type="checkbox"
          checked={codesSaved}
          onChange={(event) =>
            setCodesSaved(event.target.checked)
          }
          className="mt-0.5 size-4 cursor-pointer accent-[#1F7A5C]"
        />

        <span className="text-sm leading-5 text-[#405d54]">
          I have saved these recovery codes
          somewhere secure.
        </span>
      </label>

      <button
        type="button"
        disabled={!codesSaved}
        onClick={onDone}
        className="mt-5 flex w-full cursor-pointer justify-center rounded-xl bg-[#1F7A5C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#19664D] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {completionLabel}
      </button>
    </div>
  )
}