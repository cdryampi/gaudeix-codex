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
export declare const router: import("react-router").DataRouter;
