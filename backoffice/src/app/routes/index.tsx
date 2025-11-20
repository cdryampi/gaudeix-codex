import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "@/layouts/auth/AuthLayout";
import { DashboardLayout } from "@/layouts/dashboard/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardHome } from "@/features/dashboard/pages/DashboardHome";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { MediaPage } from "@/features/media/pages/MediaPage";
import { EventsPage } from "@/features/events/pages/EventsPage";
import { ROUTES } from "@/lib/config/constants";

/**
 * Application routing configuration
 *
 * Structure:
 * - / → redirects to /dashboard
 * - /login → AuthLayout + LoginPage
 * - /dashboard → DashboardLayout (protected)
 *   - /dashboard → DashboardHome
 *   - /dashboard/users → UsersPage
 *   - /dashboard/media → MediaPage
 *   - /dashboard/events → EventsPage
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
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
