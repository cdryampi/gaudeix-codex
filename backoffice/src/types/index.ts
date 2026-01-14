// Global types for application

export interface DjangoUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: "admin" | "user";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: DjangoUser;
}
