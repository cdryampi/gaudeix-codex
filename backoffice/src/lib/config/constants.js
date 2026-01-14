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
    PLACES: "/dashboard/places",
    CATEGORIES: "/dashboard/categories",
    STATIC_PAGES: "/dashboard/static-pages",
    SOCIAL: "/dashboard/settings/social",
    SITE_SETTINGS: "/dashboard/settings/site",
    VIDEO_SETTINGS: "/dashboard/settings/video",
    HEADER_MENU: "/dashboard/settings/header",
    LLM_SETTINGS: "/dashboard/settings/llm",
};
/**
 * API Configuration
 */
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
    HEALTH_CHECK_URL: import.meta.env.VITE_HEALTH_CHECK_URL || "http://localhost:8000/api/health/",
    TIMEOUT: 30000, // 30 seconds
};
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
};
/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER: "user",
    THEME: "theme",
};
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
        DETAIL: (id) => ["users", "detail", id],
    },
    MEDIA: {
        LIST: ["media", "list"],
        DETAIL: (id) => ["media", "detail", id],
    },
    EVENTS: {
        LIST: ["events", "list"],
        DETAIL: (id) => ["events", "detail", id],
    },
    PLACES: {
        LIST: ["places", "list"],
        DETAIL: (id) => ["places", "detail", id],
    },
    STATIC_PAGES: {
        LIST: ["static-pages", "list"],
        DETAIL: (id) => ["static-pages", "detail", id],
    },
    CATEGORIES: {
        LIST: ["categories", "list"],
        DETAIL: (id) => ["categories", "detail", id],
    },
    TAGS: {
        LIST: ["tags", "list"],
        DETAIL: (id) => ["tags", "detail", id],
    },
    SOCIAL: {
        LIST: ["social", "list"],
        DETAIL: (id) => ["social", "detail", id],
    },
};
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
        DETAIL: (id) => `/users/${id}/`,
    },
    MEDIA: {
        LIST: "/media/",
        DETAIL: (id) => `/media/${id}/`,
        UPLOAD: "/media/upload/",
    },
    EVENTS: {
        LIST: "/events/",
        DETAIL: (id) => `/events/${id}/`,
    },
    PLACES: {
        LIST: "/places/",
        DETAIL: (id) => `/places/${id}/`,
        AUTO_TRANSLATE: (id) => `/places/${id}/auto_translate/`,
    },
    STATIC_PAGES: {
        LIST: "/static-pages/",
        DETAIL: (id) => `/static-pages/${id}/`,
        AUTO_TRANSLATE: (id) => `/static-pages/${id}/auto_translate/`,
    },
    CATEGORIES: {
        LIST: "/categories/",
        DETAIL: (id) => `/categories/${id}/`,
        AUTO_TRANSLATE: (id) => `/categories/${id}/auto_translate/`,
    },
    TAGS: {
        LIST: "/tags/",
        DETAIL: (id) => `/tags/${id}/`,
    },
    SOCIAL: {
        LIST: "/social-links/",
        DETAIL: (id) => `/social-links/${id}/`,
    },
    MENU_ITEMS: {
        LIST: "/menu-items/",
        DETAIL: (id) => `/menu-items/${id}/`,
    },
    LLM: {
        CONFIG: "/llm-config/",
        TRANSLATE: "/llm-config/translate/",
        AUTO_TRANSLATE_EVENT: (id) => `/events/${id}/auto_translate/`,
        LOGS: "/translation-logs/",
    },
};
/**
 * Supported Languages with Flags
 */
export const LANGUAGES = [
    { code: "ca", name: "Català", flag: "🇦🇩" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
];
