/**
 * Authentication Service
 * Handles login, logout, and token management
 */
import { envConfig } from "@/lib/config/env";
/**
 * Authentication service
 */
export const authService = {
    /**
     * Login with username and password
     */
    async login(credentials) {
        const response = await fetch(`${envConfig.apiBaseUrl}/auth/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Login failed" }));
            throw new Error(error.detail || "Login failed");
        }
        return response.json();
    },
    /**
     * Logout (client-side only, invalidate tokens)
     */
    logout() {
        // In a real app, you might want to call a backend endpoint to invalidate the token
        // For now, we just clear the client-side state
    },
    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        const response = await fetch(`${envConfig.apiBaseUrl}/auth/token/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }
        return response.json();
    },
    /**
     * Get current user info
     */
    async getCurrentUser(token) {
        const response = await fetch(`${envConfig.apiBaseUrl}/auth/me/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }
        return response.json();
    },
    /**
     * Register new user
     */
    async register(data) {
        const response = await fetch(`${envConfig.apiBaseUrl}/auth/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Registration failed" }));
            throw new Error(error.detail || "Registration failed");
        }
        return response.json();
    },
    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        const response = await fetch(`${envConfig.apiBaseUrl}/auth/password/reset/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            throw new Error("Failed to request password reset");
        }
    },
    /**
     * Confirm password reset
     */
    async confirmPasswordReset(data) {
        const response = await fetch(`${envConfig.apiBaseUrl}/auth/password/reset/confirm/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to reset password");
        }
    },
};
