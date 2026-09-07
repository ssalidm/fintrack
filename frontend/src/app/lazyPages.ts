import { lazy } from 'react'

export const HomePage = lazy(
  () => import('../pages/HomePage'),
)

export const NotFoundPage = lazy(
  () => import('../pages/NotFoundPage'),
)

export const RegisterPage = lazy(
  () => import('../features/auth/pages/RegisterPage'),
)

export const LoginPage = lazy(
  () => import('../features/auth/pages/LoginPage'),
)

export const VerifyEmailPage = lazy(
  () => import('../features/auth/pages/VerifyEmailPage'),
)

export const ResendVerificationPage = lazy(
  () =>
    import('../features/auth/pages/ResendVerificationPage'),
)

export const ForgotPasswordPage = lazy(
  () =>
    import('../features/auth/pages/ForgotPasswordPage'),
)

export const ResetPasswordPage = lazy(
  () =>
    import('../features/auth/pages/ResetPasswordPage'),
)

export const DashboardPage = lazy(
  () => import('../pages/DashboardPage'),
)

export const MoneyInMotionPage = lazy(
  () =>
    import(
      '../features/money-motion/pages/MoneyInMotionPage'
    ),
)

export const AccountsPage = lazy(
  () =>
    import('../features/accounts/pages/AccountsPage'),
)

export const TransactionsPage = lazy(
  () =>
    import('../features/transactions/pages/TransactionsPage'),
)

export const TransfersPage = lazy(
  () =>
    import('../features/transfers/pages/TransfersPage'),
)

export const RecurringTransactionsPage = lazy(
  () =>
    import(
      '../features/recurring/pages/RecurringTransactionsPage'
    ),
)

export const CategoriesPage = lazy(
  () =>
    import('../features/categories/pages/CategoriesPage'),
)

export const ProfilePage = lazy(
  () =>
    import(
      '../features/profile/pages/ProfilePage'
    ),
)

export const GoalsPage = lazy(
  () =>
    import(
      '../features/goals/pages/GoalsPage'
    ),
)