import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute guards routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Restaurando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
