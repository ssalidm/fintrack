import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
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

import { ApiClientError } from '@/api/ApiClientError'
import { authApi } from '@/features/auth/api/authApi'
import AuthAlert from '@/features/auth/components/AuthAlert'
import AuthButton from '@/features/auth/components/AuthButton'
import AuthHeader from '@/features/auth/components/AuthHeader'
import AuthPanel from '@/features/auth/components/AuthPanel'

type VerificationStatus =
  | 'verifying'
  | 'success'
  | 'error'
  | 'missing'

export default function VerifyEmailPage() {
  const [searchParams] =
    useSearchParams()

  const navigate =
    useNavigate()

  const token =
    searchParams
      .get('token')
      ?.trim() ?? ''

  const attemptedToken =
    useRef<string | null>(null)

  const verificationCompleted =
    useRef(false)

  const [
    status,
    setStatus,
  ] = useState<VerificationStatus>(
    token
      ? 'verifying'
      : 'missing',
  )

  const [
    message,
    setMessage,
  ] = useState('')

  useEffect(() => {
    if (!token) {
      if (
        !verificationCompleted.current
      ) {
        setStatus('missing')
      }

      return
    }

    // Prevent duplicate requests
    // caused by StrictMode.
    if (
      attemptedToken.current ===
      token
    ) {
      return
    }

    attemptedToken.current =
      token

    setStatus('verifying')
    setMessage('')

    async function verifyEmail() {
      try {
        const response =
          await authApi.verifyEmail({
            token,
          })

        verificationCompleted.current =
          true

        setMessage(
          response.message ||
            'Your email address has been verified.',
        )

        setStatus('success')

        // Remove the consumed token
        // from the address bar.
        navigate(
          '/verify-email',
          {
            replace: true,
          },
        )
      } catch (error) {
        if (
          error instanceof
          ApiClientError
        ) {
          setMessage(
            error.isNetworkError
              ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
              : error.message,
          )
        } else {
          setMessage(
            'We could not verify your email. Please try again.',
          )
        }

        setStatus('error')
      }
    }

    void verifyEmail()
  }, [
    navigate,
    token,
  ])

  if (
    status === 'verifying'
  ) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="verification-title"
          aria-busy="true"
        >
          <LoaderCircle
            size={28}
            className="mb-5 animate-spin text-[#16805f]"
            aria-hidden
          />

          <AuthHeader
            title="Verifying your email"
            description="This should only take a moment."
            titleId="verification-title"
          />
        </div>
      </AuthPanel>
    )
  }

  if (
    status === 'success'
  ) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="verification-title"
        >
          <span className="mb-5 grid size-10 place-items-center rounded-full bg-[#e5f1eb] text-[#16805f]">
            <CheckCircle2
              size={20}
              aria-hidden
            />
          </span>

          <AuthHeader
            title="Your email is verified"
            description={
              message
            }
            titleId="verification-title"
          />

          <div className="mt-6">
            <AuthButton
              type="button"
              onClick={() =>
                navigate('/login')
              }
            >
              Continue to sign in
            </AuthButton>
          </div>
        </div>
      </AuthPanel>
    )
  }

  const missingToken =
    status === 'missing'

  return (
    <AuthPanel className="auth-panel-enter">
      <div
        aria-labelledby="verification-title"
      >
        <span className="mb-5 grid size-10 place-items-center rounded-full bg-red-50 text-red-600">
          <CircleAlert
            size={20}
            aria-hidden
          />
        </span>

        <AuthHeader
          title={
            missingToken
              ? 'Verification link missing'
              : 'Verification unsuccessful'
          }
          description={
            missingToken
              ? 'Open the complete verification link from the email we sent you.'
              : undefined
          }
          titleId="verification-title"
        />

        {!missingToken && (
          <div className="mt-5">
            <AuthAlert variant="error">
              {message}
            </AuthAlert>
          </div>
        )}

        <div className="mt-6">
          <AuthButton
            type="button"
            onClick={() =>
              navigate(
                '/resend-verification',
              )
            }
          >
            Request a new link
          </AuthButton>
        </div>

        <p className="mt-5 text-center text-sm text-[#657972]">
          <Link
            to="/login"
            className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </AuthPanel>
  )
}