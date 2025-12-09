/**
 * Application Routes Constants
 */
export const ROUTES = {
  // Public routes
  HOME: "/",
  TEST: "/test",
  
  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  RESET_PASSWORD: "/reset-password",
  
  // Protected routes - Dashboard
  DASHBOARD: "/dashboard",
  DASHBOARD_HOME: "/dashboard",
  
  // Dashboard subroutes (full paths for navigation)
  USERS: "/dashboard/users",
  MEDIA: "/dashboard/media",
  EVENTS: "/dashboard/events",
  SOCIAL: "/dashboard/social",
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  HEALTH_CHECK_URL: import.meta.env.VITE_HEALTH_CHECK_URL || "http://localhost:8000/api/health/",
  TIMEOUT: 30000, // 30 seconds
} as const;

// Export individual constants for backward compatibility
export const HEALTH_CHECK_URL = API_CONFIG.HEALTH_CHECK_URL;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  NAME: "Gaudeix Backoffice",
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  },
  EVENTS: {
    PAGE_SIZE_DEFAULT: Number(import.meta.env.VITE_EVENTS_PAGE_SIZE_DEFAULT) || 5,
  },
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  THEME: "theme",
} as const;

/**
 * Query Keys for React Query
 */
export const QUERY_KEYS = {
  AUTH: {
    USER: ["auth", "user"],
    SESSION: ["auth", "session"],
  },
  USERS: {
    LIST: ["users", "list"],
    DETAIL: (id: string) => ["users", "detail", id],
  },
  MEDIA: {
    LIST: ["media", "list"],
    DETAIL: (id: string) => ["media", "detail", id],
  },
  EVENTS: {
    LIST: ["events", "list"],
    DETAIL: (id: string) => ["events", "detail", id],
  },
  SOCIAL: {
    LIST: ["social", "list"],
    DETAIL: (id: string) => ["social", "detail", id],
  },
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/token/refresh/",
    ME: "/auth/me/",
    PASSWORD_RESET: "/auth/password/reset/",
    PASSWORD_RESET_CONFIRM: "/auth/password/reset/confirm/",
  },
  USERS: {
    LIST: "/users/",
    DETAIL: (id: string) => `/users/${id}/`,
  },
  MEDIA: {
    LIST: "/media/",
    DETAIL: (id: string) => `/media/${id}/`,
    UPLOAD: "/media/upload/",
  },
  EVENTS: {
    LIST: "/events/",
    DETAIL: (id: string) => `/events/${id}/`,
  },
  SOCIAL: {
    LIST: "/social-links/",
    DETAIL: (id: string) => `/social-links/${id}/`,
  },
  LLM: {
    CONFIG: "/llm-config/",
    TRANSLATE: "/llm-config/translate/",
    AUTO_TRANSLATE_EVENT: (id: string) => `/events/${id}/auto_translate/`,
  },
} as const;

/**
 * Supported Languages with Flags
 */
export const LANGUAGES = [
  { code: "ca", name: "Català", flag: "🇦🇩" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const;
