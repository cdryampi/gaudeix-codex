import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";
/**
 * ProtectedRoute guards routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: ROUTES.LOGIN, replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
