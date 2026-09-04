import {createBrowserRouter} from "react-router";
import HomePage from "../pages/HomePage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import AuthLayout from "../features/auth/layouts/AuthLayout.tsx";
import RegisterPage from "../features/auth/pages/RegisterPage.tsx";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage.tsx";
import ResendVerificationPage from "../features/auth/pages/ResendVerificationPage.tsx";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage.tsx";

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
        path: 'dashboard',
        element: <DashboardPage/>,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage/>
  },
])
