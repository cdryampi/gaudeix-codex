import client from '@/lib/api/client';
import { LoginCredentials, LoginResponse } from '@/types';
import { authStorage } from '@/lib/storage/authStorage';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await client.post<LoginResponse>('/auth/login/', credentials);
    // Automatically store tokens on success
    if (data.access && data.refresh) {
      // Use saveSession to store tokens, though user data will be updated later
      // We pass a dummy user initially or update authStorage methods to be more granular if needed
      // But authStorage has separate setters, so we can use those.
      authStorage.setAccessToken(data.access);
      authStorage.setRefreshToken(data.refresh);
    }
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await client.post('/auth/logout/');
    } catch (error) {
      console.warn('Logout failed', error);
    } finally {
      authStorage.clear();
    }
  },

  getCurrentUser: async () => {
    const { data } = await client.get('/users/me/');
    return data;
  }
};
