import { lazy } from 'react'

export const HomePage = lazy(
  () => import('../pages/HomePage'),
)

export const NotFoundPage = lazy(
  () => import('../pages/NotFoundPage'),
)

export const SupportPage = lazy(
  () => import('../pages/SupportPage'),
)

export const RegisterPage = lazy(
  () => import('../features/auth/pages/RegisterPage'),
)

export const LoginPage = lazy(
  () => import('../features/auth/pages/LoginPage'),
)

export const MfaChallengePage = lazy(
  () => import('../features/auth/pages/MfaChallengePage'),
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

export const BudgetsPage = lazy(
  () =>
    import(
      '../features/budgets/pages/BudgetsPage'
    ),
)

export const VerifyEmailChangePage = lazy(
  () =>
    import(
      '../features/auth/pages/VerifyEmailChangePage'
    ),
)

export const AdminUsersPage = lazy(
  () =>
    import(
      '../features/admin/pages/AdminUsersPage'
    ),
)

export const AdminUserDetailsPage = lazy(
  () =>
    import(
      '../features/admin/pages/AdminUserDetailsPage'
    ),
)

export const PrivacyPage = lazy(
  () =>
    import('../pages/LegalPages').then(
      (module) => ({
        default:
          module.PrivacyPage,
      }),
    ),
)

export const TermsPage = lazy(
  () =>
    import('../pages/LegalPages').then(
      (module) => ({
        default:
          module.TermsPage,
      }),
    ),
)