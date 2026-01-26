/**
 * Authentication Service
 * Handles login, logout, and token management
 */
import client from "@/lib/api/client";
/**
 * Authentication service
 */
export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials) {
    const { data } = await client.post("/auth/login/", credentials);
    return data;
  },
  /**
   * Logout (invalidate tokens)
   */
  async logout() {
    await client.post("/auth/logout/");
  },
  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const { data } = await client.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });
    return data;
  },
  /**
   * Get current user info
   */
  async getCurrentUser(token) {
    // Token is optional now as it might be handled by cookies/interceptor
    const { data } = await client.get("/auth/user/");
    return data;
  },
  /**
   * Register new user
   */
  async register(data) {
    const { data: responseData } = await client.post("/auth/register/", data);
    return responseData;
  },
  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    await client.post("/auth/password/reset/", { email });
  },
  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data) {
    await client.post("/auth/password/reset/confirm/", data);
  },
};
