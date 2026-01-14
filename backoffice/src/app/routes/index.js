import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { DashboardHome } from "@/features/dashboard/pages/DashboardHome";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { MediaPage } from "@/features/media/pages/MediaPage";
import { EventsPage } from "@/features/events/pages/EventsPage";
import { PlacesPage } from "@/features/places/pages/PlacesPage";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { TestFormPage } from "@/features/test/pages/TestFormPage";
import { ROUTES } from "@/lib/config/constants";
import { SocialLinksPage } from "@/features/social/pages/SocialLinksPage";
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { StaticPagesPage } from "@/features/static-pages/pages/StaticPagesPage";
import { SiteSettingsPage } from "@/features/site-settings/pages/SiteSettingsPage";
import { VideoSettingsPage } from "@/features/site-settings/pages/VideoSettingsPage";
import { HeaderMenuPage } from "@/features/site-settings/pages/HeaderMenuPage";
import { LLMSettingsPage } from "@/features/llm-settings/pages/LLMSettingsPage";
/**
 * Application routing configuration
 *
 * Structure:
 * - / → Landing Page
 * - /test → Test Form Page (public)
 * - /login-debug → Debug Login Page (HTML básico)
 * - /login → AuthLayout + LoginPage
 * - /register → AuthLayout + RegisterPage
 * - /reset-password → AuthLayout + ResetPasswordPage
 * - /dashboard → DashboardLayout (protected)
 */
export const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(LandingPage, {}),
    },
    {
        path: "/test",
        element: _jsx(TestFormPage, {}),
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
            {
                path: "places",
                element: _jsx(PlacesPage, {}),
            },
            {
                path: "categories",
                element: _jsx(CategoriesPage, {}),
            },
            {
                path: "social",
                element: _jsx(SocialLinksPage, {}),
            },
            {
                path: "static-pages",
                element: _jsx(StaticPagesPage, {}),
            },
            {
                path: "settings/site",
                element: _jsx(SiteSettingsPage, {}),
            },
            {
                path: "settings/video",
                element: _jsx(VideoSettingsPage, {}),
            },
            {
                path: "settings/header",
                element: _jsx(HeaderMenuPage, {}),
            },
            {
                path: "settings/social",
                element: _jsx(SocialLinksPage, {}),
            },
            {
                path: "settings/llm",
                element: _jsx(LLMSettingsPage, {}),
            },
        ],
    },
]);
