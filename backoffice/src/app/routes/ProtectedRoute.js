import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";
/**
 * ProtectedRoute guards routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isRestoringSession } = useAuth();
  if (isRestoringSession) {
    return _jsx("div", {
      className:
        "flex h-48 items-center justify-center text-sm text-muted-foreground",
      children: "Restaurando sesi\u00F3n...",
    });
  }
  if (!isAuthenticated) {
    return _jsx(Navigate, { to: ROUTES.LOGIN, replace: true });
  }
  return _jsx(_Fragment, { children: children });
}
