import {createBrowserRouter} from 'react-router'
import ProtectedRoute from '../features/auth/components/ProtectedRoute.tsx'
import AuthLayout from '../features/auth/layouts/AuthLayout.tsx'
import DashboardLayout from '../features/dashboard/layouts/DashboardLayout.tsx'
import {
  AccountsPage,
  CategoriesPage,
  DashboardPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  MoneyInMotionPage,
  NotFoundPage,
  RecurringTransactionsPage,
  RegisterPage,
  ResendVerificationPage,
  ResetPasswordPage,
  TransactionsPage,
  TransfersPage,
  VerifyEmailPage,
} from './lazyPages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage/>,
  },
  {
    element: <AuthLayout/>,
    children: [
      {
        path: '/login',
        element: <LoginPage/>,
      },
      {
        path: '/register',
        element: <RegisterPage/>,
      },
      {
        path: '/verify-email',
        element: <VerifyEmailPage/>,
      },
      {
        path: '/resend-verification',
        element: <ResendVerificationPage/>,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage/>,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage/>,
      },
    ],
  },
  {
    element: <ProtectedRoute/>,
    children: [
      {
        element: <DashboardLayout/>,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage/>,
          },
          {
            path: '/money-in-motion',
            element: <MoneyInMotionPage/>,
          },
          {
            path: '/transactions',
            element: <TransactionsPage/>,
          },
          {
            path: '/transfers',
            element: <TransfersPage/>,
          },
          {
            path: '/recurring',
            element: <RecurringTransactionsPage/>,
          },
          {
            path: '/categories',
            element: <CategoriesPage/>,
          },
          {
            path: '/accounts',
            element: <AccountsPage/>,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage/>,
  },
])