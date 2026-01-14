/**
 * Authentication Storage
 * 
 * Manages authentication tokens using Expo Secure Store for sensitive data
 * and AsyncStorage for non-sensitive data.
 */
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
} as const;

export const authStorage = {
  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Set both access and refresh tokens
   */
  async setTokens(access: string, refresh: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, access),
        SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refresh),
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  },

  /**
   * Set access token only (used in refresh flow)
   */
  async setAccessToken(access: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, access);
    } catch (error) {
      console.error('Error setting access token:', error);
      throw error;
    }
  },

  /**
   * Clear all tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated (has tokens)
   */
  async hasTokens(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      return !!(accessToken && refreshToken);
    } catch (error) {
      console.error('Error checking tokens:', error);
      return false;
    }
  },
};
