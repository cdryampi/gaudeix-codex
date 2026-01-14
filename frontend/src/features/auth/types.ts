/**
 * Auth Types
 *
 * TypeScript types for authentication, user data and API responses.
 */

export type User = {
  id: number;
  username: string;
  email: string;
  name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
};

export type LoginCredentials = {
  username: string; // Can be username or email
  password: string;
};

export type LoginResponse = {
  user: User;
  access: string;
  refresh: string;
};

export type RegisterData = {
  username: string;
  email: string;
  name: string;
  password: string;
  password_confirm: string;
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetConfirm = {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
};

export type ApiError = {
  non_field_errors?: string[];
  username?: string[];
  email?: string[];
  password?: string[];
  password_confirm?: string[];
  new_password?: string[];
  new_password_confirm?: string[];
  uid?: string[];
  token?: string[];
  detail?: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
