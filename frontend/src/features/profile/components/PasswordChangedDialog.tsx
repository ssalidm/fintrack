import {
  ArrowRight,
  Check,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

interface PasswordChangedDialogProps {
  onContinue: () => Promise<void>
}

const redirectDelaySeconds = 20

export default function PasswordChangedDialog({
  onContinue,
}: PasswordChangedDialogProps) {
  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(redirectDelaySeconds)

  const [
    isRedirecting,
    setIsRedirecting,
  ] = useState(false)

  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        setSecondsRemaining(
          (current) =>
            Math.max(
              0,
              current - 1,
            ),
        )
      }, 1000)

    const redirectId =
      window.setTimeout(() => {
        void onContinue()
      }, redirectDelaySeconds * 1000)

    return () => {
      window.clearInterval(
        intervalId,
      )

      window.clearTimeout(
        redirectId,
      )
    }
  }, [onContinue])

  async function handleContinue() {
    setIsRedirecting(true)
    await onContinue()
  }

  const progress =
    (
      secondsRemaining /
      redirectDelaySeconds
    ) * 100

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-changed-title"
      aria-describedby="password-changed-description"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        p-5
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full max-w-md
          overflow-hidden
          rounded-3xl
          border border-line
          bg-surface
          shadow-2xl
        "
      >
        <div
          className="
            bg-primary
            px-7 py-8
            text-inverse
            sm:px-9
          "
        >
          <div className="flex items-start justify-between gap-5">
            <span
              className="
                grid size-14 shrink-0
                place-items-center
                rounded-full
                bg-accent-soft
                text-accent
              "
            >
              <ShieldCheck
                size={27}
                aria-hidden
              />
            </span>

            <span
              className="
                grid size-8
                place-items-center
                rounded-full
                bg-white/10
                text-inverse
              "
            >
              <Check
                size={17}
                aria-hidden
              />
            </span>
          </div>

          <p
            className="
              mt-7
              text-xs
              font-semibold
              tracking-[0.16em]
              text-accent-soft
            "
          >
            PASSWORD UPDATED
          </p>

          <h2
            id="password-changed-title"
            className="
              mt-3
              font-serif
              text-4xl
              leading-tight
              tracking-[-0.025em]
            "
          >
            Your password has been changed.
          </h2>
        </div>

        <div className="px-7 py-7 sm:px-9">
          <p
            id="password-changed-description"
            className="text-sm leading-6 text-muted"
          >
            For your security, Salif has closed your
            active sessions. Sign in again using your
            new password.
          </p>

          <div
            className="
              mt-6
              rounded-2xl
              bg-surface-muted
              px-5 py-4
            "
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink">
                Returning to sign in
              </p>

              <p
                aria-live="polite"
                className="font-serif text-2xl text-accent"
              >
                {secondsRemaining}s
              </p>
            </div>

            <div
              className="
                mt-3
                h-1.5
                overflow-hidden
                rounded-full
                bg-surface-strong
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-accent
                  transition-[width]
                  duration-1000
                  ease-linear
                "
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            autoFocus
            disabled={
              isRedirecting
            }
            onClick={
              handleContinue
            }
            className="
              mt-6
              inline-flex
              w-full
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-full
              bg-primary
              px-6
              py-3.5
              text-sm
              font-semibold
              text-inverse
              transition
              hover:bg-primary-hover
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isRedirecting ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                  aria-hidden
                />

                Signing out
              </>
            ) : (
              <>
                Sign in now

                <ArrowRight
                  size={17}
                  aria-hidden
                />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-subtle">
            You’ll need your new password on every
            device where you use Salif.
          </p>
        </div>
      </div>
    </div>
  )
}