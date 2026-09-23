import {
  createBrowserRouter,
  Navigate,
} from 'react-router'

import AdminRoute from '../features/admin/components/AdminRoute.tsx'
import ProtectedRoute from '../features/auth/components/ProtectedRoute.tsx'
import AuthLayout from '../features/auth/layouts/AuthLayout.tsx'
import DashboardLayout from '../features/dashboard/layouts/DashboardLayout.tsx'
import RouteErrorPage from '../pages/RouteErrorPage.tsx'

import {
  HomePage,
  NotFoundPage,
  SupportPage,
  CompleteRegistrationPage,
  LoginPage,
  MfaChallengePage,
  RegisterPage,
  VerifyEmailPage,
  ResendVerificationPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailChangePage,
  PrivacyPage,
  TermsPage,
  DashboardPage,
  ProfilePage,
  AccountsPage,
  CategoriesPage,
  TransactionsPage,
  RecurringTransactionsPage,
  TransfersPage,
  GoalsPage,
  BudgetsPage,
  AdminUsersPage,
  AdminUserDetailsPage,
} from './lazyPages'

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/support',
        element: <SupportPage />,
      },
      {
        path: '/privacy',
        element: <PrivacyPage />,
      },
      {
        path: '/terms',
        element: <TermsPage />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/register/complete',
            element: <CompleteRegistrationPage />,
          },
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/login/mfa',
            element: <MfaChallengePage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
          {
            path: '/verify-email',
            element: <VerifyEmailPage />,
          },
          {
            path: '/resend-verification',
            element: <ResendVerificationPage />,
          },
          {
            path: '/forgot-password',
            element: <ForgotPasswordPage />,
          },
          {
            path: '/reset-password',
            element: <ResetPasswordPage />,
          },
          {
            path: '/verify-email-change',
            element: <VerifyEmailChangePage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: '/dashboard',
                element: <DashboardPage />,
              },
              {
                path: '/profile',
                element: <ProfilePage />,
              },
              {
                path: '/money-in-motion',
                element: (
                  <Navigate
                    to="/transactions"
                    replace
                  />
                ),
              },
              {
                path: '/transactions',
                element: <TransactionsPage />,
              },
              {
                path: '/transfers',
                element: <TransfersPage />,
              },
              {
                path: '/recurring',
                element: <RecurringTransactionsPage />,
              },
              {
                path: '/categories',
                element: <CategoriesPage />,
              },
              {
                path: '/accounts',
                element: <AccountsPage />,
              },
              {
                path: '/goals',
                element: <GoalsPage />,
              },
              {
                path: '/budgets',
                element: <BudgetsPage />,
              },
              {
                element: <AdminRoute />,
                children: [
                  {
                    path: '/admin/users',
                    element: <AdminUsersPage />,
                  },
                  {
                    path: '/admin/users/:userId',
                    element: <AdminUserDetailsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])