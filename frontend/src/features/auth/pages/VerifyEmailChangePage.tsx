import {
  CheckCircle2,
  LoaderCircle,
  MailWarning,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/useAuth'

type ConfirmationStatus =
  | 'confirming'
  | 'success'
  | 'error'
  | 'missing'

export default function VerifyEmailChangePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const attemptedToken = useRef<string | null>(null)
  const confirmationCompleted = useRef(false)

  const token =
    searchParams.get('token')?.trim() ?? ''

  const [status, setStatus] =
    useState<ConfirmationStatus>(
      token ? 'confirming' : 'missing',
    )

  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      if (!confirmationCompleted.current) {
        setStatus('missing')
      }

      return
    }

    if (attemptedToken.current === token) {
      return
    }

    attemptedToken.current = token
    setStatus('confirming')
    setMessage('')

    async function confirmChange() {
      try {
        const response =
          await authApi.confirmEmailChange({ token })

        confirmationCompleted.current = true

        await logout().catch(() => undefined)

        setMessage(
          response.message ||
          'Your email address has been changed successfully.',
        )

        setStatus('success')

        navigate('/verify-email-change', {
          replace: true,
        })
      } catch (error) {
        setMessage(
          error instanceof ApiClientError
            ? error.isNetworkError
              ? 'Unable to reach Salif. Check that the backend is running.'
              : error.message
            : 'We could not confirm your new email address.',
        )

        setStatus('error')
      }
    }

    void confirmChange()
  }, [logout, navigate, token])

  if (status === 'confirming') {
    return (
      <section
        className="w-full max-w-md text-center"
        aria-labelledby="email-change-title"
        aria-busy="true"
      >
        <LoaderCircle
          size={42}
          className="mx-auto animate-spin text-[#1F7A5C]"
          aria-hidden
        />

        <h1
          id="email-change-title"
          className="mt-6 text-3xl font-semibold text-slate-950"
        >
          Confirming your new email
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          We’re securely updating your Salif account.
        </p>
      </section>
    )
  }

  if (status === 'success') {
    return (
      <section
        className="w-full max-w-md text-center"
        aria-labelledby="email-change-title"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-[#1F7A5C]">
          <CheckCircle2 size={29} aria-hidden />
        </span>

        <p className="mt-5 text-sm font-semibold text-[#1F7A5C]">
          Email updated
        </p>

        <h1
          id="email-change-title"
          className="mt-2 text-3xl font-semibold text-slate-950"
        >
          Your new address is ready
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {message} For your security, your previous
          sessions have been closed. Sign in using your
          new email address.
        </p>

        <Link
          to="/login"
          state={{
            message:
              'Email changed successfully. Sign in with your new email address.',
          }}
          className="mt-7 inline-flex cursor-pointer rounded-lg bg-[#1F7A5C] px-5 py-2.5 font-semibold text-white transition hover:bg-[#19664D]"
        >
          Continue to sign in
        </Link>
      </section>
    )
  }

  const missingToken = status === 'missing'

  return (
    <section
      className="w-full max-w-md text-center"
      aria-labelledby="email-change-title"
    >
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-red-100 text-red-600">
        <MailWarning size={28} aria-hidden />
      </span>

      <h1
        id="email-change-title"
        className="mt-6 text-3xl font-semibold text-slate-950"
      >
        {missingToken
          ? 'Confirmation token missing'
          : 'Email change unsuccessful'}
      </h1>

      <p
        className="mt-3 text-sm leading-6 text-slate-600"
        role="alert"
      >
        {missingToken
          ? 'Open the complete email-change link from your inbox.'
          : message}
      </p>

      <Link
        to="/login"
        className="mt-7 inline-flex cursor-pointer font-semibold text-[#1F7A5C] hover:underline"
      >
        Return to sign in
      </Link>
    </section>
  )
}