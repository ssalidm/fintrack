import {createBrowserRouter} from "react-router"

import ProtectedRoute from "../features/auth/components/ProtectedRoute.tsx"
import DashboardLayout from "../features/dashboard/layouts/DashboardLayout.tsx"
import AuthLayout from "../features/auth/layouts/AuthLayout.tsx";
import {
  AccountsPage,
  DashboardPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  ResendVerificationPage,
  ResetPasswordPage,
  TransactionsPage,
  VerifyEmailPage,
  CategoriesPage
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
        element: <ResendVerificationPage/>
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
            path: 'dashboard',
            element: <DashboardPage/>,
          },
          {
            path: 'accounts',
            element: <AccountsPage/>
          },
          {
            path: 'transactions',
            element: <TransactionsPage/>
          },
          {
            path: 'categories',
            element: <CategoriesPage/>
          }
        ]
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage/>
  },
])
