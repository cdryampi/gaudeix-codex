/**
 * API Client
 * 
 * Axios instance with interceptors for authentication and error handling.
 * Adapdated from backoffice implementation for React Native/Expo.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { envConfig } from '@/lib/config/env';
import { authStorage } from '@/lib/storage/authStorage';

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Flag to prevent multiple simultaneous refresh requests
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await authStorage.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh(async (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await authStorage.getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token, clear storage and reject
          await authStorage.clearTokens();
          isRefreshing = false;
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(
          `${envConfig.apiBaseUrl}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        await authStorage.setAccessToken(access);
        
        isRefreshing = false;
        onTokenRefreshed(access);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear storage
        await authStorage.clearTokens();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
