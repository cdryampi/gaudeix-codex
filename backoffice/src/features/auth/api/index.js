import client from '@/lib/api/client';
import { authStorage } from '@/lib/storage/authStorage';
export const authApi = {
    login: async (credentials) => {
        const { data } = await client.post('/auth/login/', credentials);
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
    logout: async () => {
        try {
            await client.post('/auth/logout/');
        }
        catch (error) {
            console.warn('Logout failed', error);
        }
        finally {
            authStorage.clear();
        }
    },
    getCurrentUser: async () => {
        const { data } = await client.get('/users/me/');
        return data;
    }
};
