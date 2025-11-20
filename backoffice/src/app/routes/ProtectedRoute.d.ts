interface ProtectedRouteProps {
    children: React.ReactNode;
}
/**
 * ProtectedRoute guards routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
export declare function ProtectedRoute({ children }: ProtectedRouteProps): import("react/jsx-runtime").JSX.Element;
export {};
