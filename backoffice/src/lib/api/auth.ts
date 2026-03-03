/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import client from "@/lib/api/client";
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
export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await client.post<LoginResponse>(
      "/auth/login/",
      credentials,
    );
    return data;
  },

  /**
   * Logout (invalidate tokens)
   */
  async logout(): Promise<void> {
    await client.post("/auth/logout/");
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await client.post<RefreshResponse>(
      "/auth/token/refresh/",
      {
        refresh: refreshToken,
      },
    );
    return data;
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    // Token is optional now as it might be handled by cookies/interceptor
    const { data } = await client.get<User>("/auth/user/");
    return data;
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
    const { data: responseData } = await client.post<LoginResponse>(
      "/auth/register/",
      data,
    );
    return responseData;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await client.post("/auth/password/reset/", { email });
  },

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: {
    token: string;
    uid: string;
    new_password: string;
  }): Promise<void> {
    await client.post("/auth/password/reset/confirm/", data);
  },
};
