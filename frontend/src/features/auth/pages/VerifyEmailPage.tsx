import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router'
import {ApiClientError} from '../../../api/ApiClientError'
import {authApi} from '../api/authApi'

type VerificationStatus = 'verifying' | 'success' | 'error' | 'missing'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')?.trim() ?? ''
  const attemptedToken = useRef<string | null>(null)
  const verificationCompleted = useRef(false)

  const [status, setStatus] = useState<VerificationStatus>(
    token ? 'verifying' : 'missing',
  )
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      if (!verificationCompleted.current) {
        setStatus('missing')
      }
      return
    }

    // Prevent duplicate requests caused by StrictMode.
    if (attemptedToken.current === token) {
      return
    }

    attemptedToken.current = token
    setStatus('verifying')
    setMessage('')

    async function verifyEmail() {
      try {
        const response = await authApi.verifyEmail({token})

        verificationCompleted.current = true

        setMessage(
          response.message || 'Your email address has been verified.',
        )
        setStatus('success')

        // Remove the one-time token from the address bar and browser history.
        navigate('/verify-email', {replace: true})
      } catch (error) {
        if (error instanceof ApiClientError) {
          setMessage(
            error.isNetworkError
              ? 'Unable to reach Salif. Check that the backend is running.'
              : error.message,
          )
        } else {
          setMessage('We could not verify your email. Please try again.')
        }

        setStatus('error')
      }
    }

    void verifyEmail()
  }, [navigate, token])

  if (status === 'verifying') {
    return (
      <section
        className="w-full max-w-md text-center"
        aria-labelledby="verification-title"
        aria-busy="true"
      >
        <div
          className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#1F7A5C]"
          aria-hidden="true"
        />

        <h1
          id="verification-title"
          className="mt-6 text-3xl font-semibold text-slate-950"
        >
          Verifying your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          This should only take a moment.
        </p>
      </section>
    )
  }

  if (status === 'success') {
    return (
      <section
        className="w-full max-w-md text-center"
        aria-labelledby="verification-title"
      >
        <div
          className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-[#1F7A5C]"
          aria-hidden="true"
        >
          <svg
            className="size-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6"/>
          </svg>
        </div>

        <p className="mt-5 text-sm font-semibold text-[#1F7A5C]">
          Verification complete
        </p>

        <h1
          id="verification-title"
          className="mt-2 text-3xl font-semibold text-slate-950"
        >
          Your email is verified
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {message}
        </p>

        <Link
          to="/login"
          className="mt-7 inline-flex rounded-lg bg-[#1F7A5C] px-5 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2"
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
      aria-labelledby="verification-title"
    >
      <div
        className="mx-auto grid size-14 place-items-center rounded-full bg-red-100 text-red-600"
        aria-hidden="true"
      >
        <svg
          className="size-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 8v5"/>
          <path d="M12 17h.01"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
      </div>

      <h1
        id="verification-title"
        className="mt-6 text-3xl font-semibold text-slate-950"
      >
        {missingToken
          ? 'Verification token missing'
          : 'Verification unsuccessful'}
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600" role="alert">
        {missingToken
          ? 'Open the complete verification link from your email.'
          : message}
      </p>

      <div className="mt-7 flex flex-col items-center gap-3">
        <Link
          to="/resend-verification"
          className="inline-flex rounded-lg bg-[#1F7A5C] px-5 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2"
        >
          Request a new link
        </Link>

        <Link
          to="/login"
          className="text-sm font-semibold text-slate-700 hover:text-slate-950 hover:underline"
        >
          Return to sign in
        </Link>
      </div>
    </section>
  )
}
