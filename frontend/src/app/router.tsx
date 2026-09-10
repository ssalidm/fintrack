import { createBrowserRouter } from 'react-router'
import ProtectedRoute from '../features/auth/components/ProtectedRoute.tsx'
import AuthLayout from '../features/auth/layouts/AuthLayout.tsx'
import DashboardLayout from '../features/dashboard/layouts/DashboardLayout.tsx'
import {
  HomePage,
  LoginPage,
  MfaChallengePage,
  RegisterPage,
  VerifyEmailPage,
  ResendVerificationPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  NotFoundPage,
  DashboardPage,
  ProfilePage,
  AccountsPage,
  CategoriesPage,
  MoneyInMotionPage,
  TransactionsPage,
  RecurringTransactionsPage,
  TransfersPage,
  GoalsPage,
  BudgetsPage,
  VerifyEmailChangePage

} from './lazyPages'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <AuthLayout />,
    children: [
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
  // **********************************
  // Protected routes
  // **********************************
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
            element: <MoneyInMotionPage />,
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
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])