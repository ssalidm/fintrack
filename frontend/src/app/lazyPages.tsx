import {lazy} from 'react'

export const HomePage = lazy(
  () => import('../pages/HomePage.tsx'),
)

export const NotFoundPage = lazy(
  () => import('../pages/NotFoundPage.tsx'),
)

export const RegisterPage = lazy(
  () => import('../features/auth/pages/RegisterPage.tsx'),
)

export const LoginPage = lazy(
  () => import('../features/auth/pages/LoginPage.tsx'),
)

export const VerifyEmailPage = lazy(
  () => import('../features/auth/pages/VerifyEmailPage.tsx'),
)

export const ResendVerificationPage = lazy(
  () =>
    import('../features/auth/pages/ResendVerificationPage.tsx'),
)

export const ForgotPasswordPage = lazy(
  () =>
    import('../features/auth/pages/ForgotPasswordPage.tsx'),
)

export const ResetPasswordPage = lazy(
  () =>
    import('../features/auth/pages/ResetPasswordPage.tsx'),
)

export const DashboardPage = lazy(
  () => import('../pages/DashboardPage.tsx'),
)

export const AccountsPage = lazy(
  () =>
    import('../features/accounts/pages/AccountsPage.tsx'),
)

export const TransactionsPage = lazy(
  () =>
    import('../features/transactions/pages/TransactionsPage.tsx'),
)

export const CategoriesPage = lazy(
  () =>
    import('../features/categories/pages/CategoriesPage.tsx'),
)
