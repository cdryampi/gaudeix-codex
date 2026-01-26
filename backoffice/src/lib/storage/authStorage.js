/**
 * Authentication Storage
 * Manages authentication tokens and user data in localStorage
 */
import { STORAGE_KEYS } from "@/lib/config/constants";
/**
 * Authentication storage utility
 */
export const authStorage = {
  /**
   * Get access token from localStorage
   */
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  /**
   * Set access token in localStorage
   */
  setAccessToken(token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  /**
   * Get refresh token from localStorage
   */
  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  /**
   * Set refresh token in localStorage
   */
  setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  /**
   * Get user from localStorage
   */
  getUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },
  /**
   * Set user in localStorage
   */
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  /**
   * Save complete session (tokens + user)
   */
  saveSession(tokens, user, remember = true) {
    this.setAccessToken(tokens.access);
    this.setRefreshToken(tokens.refresh);
    this.setUser(user);
    // If remember is false, could use sessionStorage instead
    // For now, we always use localStorage
  },
  /**
   * Clear all authentication data from localStorage
   */
  clear() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },
};
