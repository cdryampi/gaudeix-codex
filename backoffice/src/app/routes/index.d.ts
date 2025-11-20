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
export declare const router: import("react-router").DataRouter;
