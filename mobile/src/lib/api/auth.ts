/**
 * Authentication Service
 * 
 * Handles authentication operations against the Django backend.
 */
import apiClient from '@/lib/api/client';
import { authStorage } from '@/lib/storage/authStorage';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
  RefreshResponse,
} from '@/types';

export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login/', credentials);
    
    // Store tokens
    await authStorage.setTokens(data.access, data.refresh);
    
    return data;
  },

  /**
   * Logout (clear tokens and optionally call backend)
   */
  async logout(): Promise<void> {
    try {
      // Optionally call backend logout endpoint
      await apiClient.post('/auth/logout/');
    } catch (error) {
      // Continue even if backend call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear tokens locally
      await authStorage.clearTokens();
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await apiClient.post<RefreshResponse>('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    
    // Store new access token
    await authStorage.setAccessToken(data.access);
    
    return data;
  },

  /**
   * Register new user
   */
  async register(registerData: RegisterData): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/registration/', {
      username: registerData.username,
      email: registerData.email,
      password1: registerData.password,
      password2: registerData.password_confirm,
      name: registerData.name,
    });
    
    // Store tokens
    await authStorage.setTokens(data.access, data.refresh);
    
    return data;
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me/');
    return data;
  },

  /**
   * Verify if current user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await authStorage.hasTokens();
  },
};
