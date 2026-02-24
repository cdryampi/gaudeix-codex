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
  NOTIFICATIONS: "/dashboard/notifications",
  ROUTES_HIKING: "/dashboard/routes",
  FESTES: "/dashboard/festes",
  NEWS: "/dashboard/news",
  SCRAPER: "/dashboard/scraper",
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  HEALTH_CHECK_URL:
    import.meta.env.VITE_HEALTH_CHECK_URL ||
    "http://localhost:8000/api/health/",
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
    PAGE_SIZE_DEFAULT:
      Number(import.meta.env.VITE_EVENTS_PAGE_SIZE_DEFAULT) || 5,
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
  PLACES: {
    LIST: ["places", "list"],
    DETAIL: (id: string) => ["places", "detail", id],
  },
  STATIC_PAGES: {
    LIST: ["static-pages", "list"],
    DETAIL: (id: string) => ["static-pages", "detail", id],
  },
  CATEGORIES: {
    LIST: ["categories", "list"],
    DETAIL: (id: string) => ["categories", "detail", id],
  },
  TAGS: {
    LIST: ["tags", "list"],
    DETAIL: (id: string) => ["tags", "detail", id],
  },
  SOCIAL: {
    LIST: ["social", "list"],
    DETAIL: (id: string) => ["social", "detail", id],
  },
  ROUTES_HIKING: {
    LIST: ["routes", "list"],
    DETAIL: (slug: string) => ["routes", "detail", slug],
  },
  FESTES: {
    LIST: ["festes", "list"],
    DETAIL: (slug: string) => ["festes", "detail", slug],
  },
  PROGRAMS: {
    LIST: ["programs", "list"],
    DETAIL: (slug: string) => ["programs", "detail", slug],
    BY_FESTA: (festaSlug: string) => ["programs", "by-festa", festaSlug],
  },
  VENUES: {
    LIST: ["venues", "list"],
    DETAIL: (slug: string) => ["venues", "detail", slug],
  },
  ACTIVITIES: {
    LIST: ["activities", "list"],
    DETAIL: (slug: string) => ["activities", "detail", slug],
    BY_PROGRAM: (programSlug: string) => ["activities", "by-program", programSlug],
  },
  NEWS: {
    LIST: ["news", "list"],
    DETAIL: (id: string) => ["news", "detail", id],
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
    ME: "/auth/user/",
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
  PLACES: {
    LIST: "/places/",
    DETAIL: (id: string) => `/places/${id}/`,
    AUTO_TRANSLATE: (id: string) => `/places/${id}/auto_translate/`,
  },
  STATIC_PAGES: {
    LIST: "/static-pages/",
    DETAIL: (id: string) => `/static-pages/${id}/`,
    AUTO_TRANSLATE: (id: string) => `/static-pages/${id}/auto_translate/`,
  },
  CATEGORIES: {
    LIST: "/categories/",
    DETAIL: (id: string) => `/categories/${id}/`,
    AUTO_TRANSLATE: (id: string) => `/categories/${id}/auto_translate/`,
  },
  TAGS: {
    LIST: "/tags/",
    DETAIL: (id: string) => `/tags/${id}/`,
  },
  SOCIAL: {
    LIST: "/social-links/",
    DETAIL: (id: string) => `/social-links/${id}/`,
  },
  MENU_ITEMS: {
    LIST: "/menu-items/",
    DETAIL: (id: string) => `/menu-items/${id}/`,
  },
  LLM: {
    CONFIG: "/llm-config/",
    TRANSLATE: "/llm-config/translate/",
    AUTO_TRANSLATE_EVENT: (id: string) => `/events/${id}/auto_translate/`,
    LOGS: "/translation-logs/",
  },
  ROUTES_HIKING: {
    LIST: "/routes/",
    DETAIL: (slug: string) => `/routes/${slug}/`,
    AUTO_TRANSLATE: (slug: string) => `/routes/${slug}/auto_translate/`,
  },
  FESTES: {
    LIST: "/festes/",
    DETAIL: (slug: string) => `/festes/${slug}/`,
    CURRENT: "/festes/current/",
    AUTO_TRANSLATE: (slug: string) => `/festes/${slug}/auto_translate/`,
  },
  PROGRAMS: {
    LIST: "/programs/",
    DETAIL: (slug: string) => `/programs/${slug}/`,
    BY_FESTA: (festaSlug: string) => `/programs/?festa=${festaSlug}/`,
  },
  VENUES: {
    LIST: "/venues/",
    DETAIL: (slug: string) => `/venues/${slug}/`,
  },
  ACTIVITIES: {
    LIST: "/activities/",
    DETAIL: (slug: string) => `/activities/${slug}/`,
    BY_PROGRAM: (programSlug: string) => `/activities/?program=${programSlug}/`,
  },
  SPONSORS: {
    LIST: "/sponsors/",
    DETAIL: (id: string) => `/sponsors/${id}/`,
  },
  NEWS: {
    LIST: "/news/",
    DETAIL: (id: string) => `/news/${id}/`,
    DELETE_BY_ID: (id: string) => `/news/by-id/${id}/`,
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
