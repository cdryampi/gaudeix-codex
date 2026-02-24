import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "@/layouts/auth/AuthLayout";
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
import { SendNotificationPage } from "@/features/notifications/pages/SendNotificationPage";
import { RoutesPage } from "@/features/routes/pages/RoutesPage";
import { FestesPage } from "@/features/festes/pages/FestesPage";
import { ProgramsPage } from "@/features/festes/pages/ProgramsPage";
import { VenuesPage } from "@/features/festes/pages/VenuesPage";
import { NewsPage } from "@/features/news/pages/NewsPage";
import { ActivitiesPage } from "@/features/festes/pages/ActivitiesPage";
import { ScrapedNewsPage } from "@/features/scraper/pages/ScrapedNewsPage";

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
    element: <LandingPage />,
  },
  {
    path: "/test",
    element: <TestFormPage />,
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
      {
        path: "places",
        element: <PlacesPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "social",
        element: <SocialLinksPage />,
      },
      {
        path: "static-pages",
        element: <StaticPagesPage />,
      },
      {
        path: "settings/site",
        element: <SiteSettingsPage />,
      },
      {
        path: "settings/video",
        element: <VideoSettingsPage />,
      },
      {
        path: "settings/header",
        element: <HeaderMenuPage />,
      },
      {
        path: "settings/social",
        element: <SocialLinksPage />,
      },
      {
        path: "settings/llm",
        element: <LLMSettingsPage />,
      },
      {
        path: "notifications",
        element: <SendNotificationPage />,
      },
      {
        path: "routes",
        element: <RoutesPage />,
      },
      {
        path: "festes",
        element: <FestesPage />,
      },
      {
        path: "festes/programs",
        element: <ProgramsPage />,
      },
      {
        path: "festes/venues",
        element: <VenuesPage />,
      },
      {
        path: "festes/activities",
        element: <ActivitiesPage />,
      },
      {
        path: "news",
        element: <NewsPage />,
      },
      {
        path: "scraper",
        element: <ScrapedNewsPage />,
      },
    ],
  },
]);
