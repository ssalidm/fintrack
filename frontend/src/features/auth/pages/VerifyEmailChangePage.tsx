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
  useNavigate,
  useSearchParams,
} from 'react-router'

import { ApiClientError } from '@/api/ApiClientError'
import { authApi } from '@/features/auth/api/authApi'
import AuthAlert from '@/features/auth/components/AuthAlert'
import AuthButton from '@/features/auth/components/AuthButton'
import AuthHeader from '@/features/auth/components/AuthHeader'
import AuthPanel from '@/features/auth/components/AuthPanel'
import { useAuth } from '@/features/auth/context/useAuth'

type ConfirmationStatus =
  | 'confirming'
  | 'success'
  | 'error'
  | 'missing'

export default function VerifyEmailChangePage() {
  const [searchParams] =
    useSearchParams()

  const navigate =
    useNavigate()

  const { logout } =
    useAuth()

  const attemptedToken =
    useRef<string | null>(null)

  const confirmationCompleted =
    useRef(false)

  const token =
    searchParams
      .get('token')
      ?.trim() ?? ''

  const [
    status,
    setStatus,
  ] = useState<ConfirmationStatus>(
    token
      ? 'confirming'
      : 'missing',
  )

  const [
    message,
    setMessage,
  ] = useState('')

  useEffect(() => {
    if (!token) {
      if (
        !confirmationCompleted.current
      ) {
        setStatus('missing')
      }

      return
    }

    if (
      attemptedToken.current ===
      token
    ) {
      return
    }

    attemptedToken.current =
      token

    setStatus('confirming')
    setMessage('')

    async function confirmChange() {
      try {
        const response =
          await authApi.confirmEmailChange({
            token,
          })

        confirmationCompleted.current =
          true

        await logout().catch(
          () => undefined,
        )

        setMessage(
          response.message ||
            'Your email address has been changed successfully.',
        )

        setStatus('success')

        navigate(
          '/verify-email-change',
          {
            replace: true,
          },
        )
      } catch (error) {
        setMessage(
          error instanceof
            ApiClientError
            ? error.isNetworkError
              ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
              : error.message
            : 'We could not confirm your new email address.',
        )

        setStatus('error')
      }
    }

    void confirmChange()
  }, [
    logout,
    navigate,
    token,
  ])

  if (
    status === 'confirming'
  ) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="email-change-title"
          aria-busy="true"
        >
          <LoaderCircle
            size={28}
            className="mb-5 animate-spin text-[#16805f]"
            aria-hidden
          />

          <AuthHeader
            title="Confirming your new email"
            description="We’re securely updating your Salif account."
            titleId="email-change-title"
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
          aria-labelledby="email-change-title"
        >
          <span className="mb-5 grid size-10 place-items-center rounded-full bg-[#e5f1eb] text-[#16805f]">
            <CheckCircle2
              size={20}
              aria-hidden
            />
          </span>

          <AuthHeader
            title="Your new email is ready"
            description={`${message} For your security, your previous sessions have been closed. Sign in using your new email address.`}
            titleId="email-change-title"
          />

          <div className="mt-6">
            <AuthButton
              type="button"
              onClick={() =>
                navigate(
                  '/login',
                  {
                    state: {
                      message:
                        'Email changed successfully. Sign in with your new email address.',
                    },
                  },
                )
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
        aria-labelledby="email-change-title"
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
              ? 'Confirmation link missing'
              : 'Email change unsuccessful'
          }
          description={
            missingToken
              ? 'Open the complete email-change link from your inbox.'
              : undefined
          }
          titleId="email-change-title"
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
              navigate('/login')
            }
          >
            Return to sign in
          </AuthButton>
        </div>
      </div>
    </AuthPanel>
  )
}