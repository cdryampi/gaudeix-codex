import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate } from "react-router-dom";
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
import { ROUTES } from "@/lib/config/constants";
/**
 * Application routing configuration
 *
 * Structure:
 * - / → redirects to /dashboard
 * - /login → AuthLayout + LoginPage
 * - /register → AuthLayout + RegisterPage
 * - /reset-password → AuthLayout + ResetPasswordPage
 * - /dashboard → DashboardLayout (protected)
 */
export const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(Navigate, { to: ROUTES.DASHBOARD, replace: true }),
    },
    {
        element: _jsx(AuthLayout, {}),
        children: [
            {
                path: ROUTES.LOGIN,
                element: _jsx(LoginPage, {}),
            },
            {
                path: "/register",
                element: _jsx(RegisterPage, {}),
            },
            {
                path: "/reset-password",
                element: _jsx(ResetPasswordPage, {}),
            },
        ],
    },
    {
        path: ROUTES.DASHBOARD,
        element: (_jsx(ProtectedRoute, { children: _jsx(DashboardLayout, {}) })),
        children: [
            {
                index: true,
                element: _jsx(DashboardHome, {}),
            },
            {
                path: "users",
                element: _jsx(UsersPage, {}),
            },
            {
                path: "media",
                element: _jsx(MediaPage, {}),
            },
            {
                path: "events",
                element: _jsx(EventsPage, {}),
            },
        ],
    },
]);
