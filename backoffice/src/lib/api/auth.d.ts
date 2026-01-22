/**
 * Authentication Service
 * Handles login, logout, and token management
 */
import type { User, DjangoUser } from "@/types";
interface LoginCredentials {
    username: string;
    password: string;
}
interface LoginResponse {
    access: string;
    refresh: string;
    user: DjangoUser;
}
interface RefreshResponse {
    access: string;
    refresh: string;
}
/**
 * Authentication service
 */
export declare const authService: {
    /**
     * Login with username and password
     */
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    /**
     * Logout (invalidate tokens)
     */
    logout(): Promise<void>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string): Promise<RefreshResponse>;
    /**
     * Get current user info
     */
    getCurrentUser(token?: string): Promise<User>;
    /**
     * Register new user
     */
    register(data: {
        username: string;
        email: string;
        password: string;
        name?: string;
    }): Promise<LoginResponse>;
    /**
     * Request password reset
     */
    requestPasswordReset(email: string): Promise<void>;
    /**
     * Confirm password reset
     */
    confirmPasswordReset(data: {
        token: string;
        uid: string;
        new_password: string;
    }): Promise<void>;
};
export {};
