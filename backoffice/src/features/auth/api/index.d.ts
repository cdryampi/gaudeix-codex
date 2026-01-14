import { LoginCredentials, LoginResponse } from '@/types';
export declare const authApi: {
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<any>;
};
