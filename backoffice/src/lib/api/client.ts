import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { envConfig } from '../config/env';
import { authStorage } from '../storage/authStorage';

const client = axios.create({
  baseURL: envConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s timeout
});

// Request Interceptor: Attach Token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle Errors & Token Refresh
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const { data } = await axios.post(`${envConfig.apiBaseUrl}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        // Store new access token
        authStorage.setAccessToken(data.access);

        // Update authorization header and retry request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
        }
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed -> Logout user
        authStorage.clear();
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
