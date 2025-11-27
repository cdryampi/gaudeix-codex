/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import { envConfig } from "@/lib/config/env";
import type { User } from "@/types";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RefreshResponse {
  access: string;
  refresh: string;
}

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
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
  logout(): void {
    // In a real app, you might want to call a backend endpoint to invalidate the token
    // For now, we just clear the client-side state
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
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
  async getCurrentUser(token: string): Promise<User> {
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
  async register(data: {
    username: string;
    email: string;
    password: string;
    name?: string;
  }): Promise<LoginResponse> {
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
  async requestPasswordReset(email: string): Promise<void> {
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
  async confirmPasswordReset(data: {
    token: string;
    uid: string;
    new_password: string;
  }): Promise<void> {
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
