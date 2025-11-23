import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { DashboardLayout } from "@/layouts/dashboard/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { DashboardHome } from "@/features/dashboard/pages/DashboardHome";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { MediaPage } from "@/features/media/pages/MediaPage";
import { EventsPage } from "@/features/events/pages/EventsPage";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { ROUTES } from "@/lib/config/constants";

/**
 * Application routing configuration
 *
 * Structure:
 * - / → Landing Page
 * - /login → AuthLayout + LoginPage
 * - /register → AuthLayout + RegisterPage
 * - /reset-password → AuthLayout + ResetPasswordPage
 * - /dashboard → DashboardLayout (protected)
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "media",
        element: <MediaPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
    ],
  },
]);
