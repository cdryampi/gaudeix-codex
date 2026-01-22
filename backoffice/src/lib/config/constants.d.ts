/**
 * Application Routes Constants
 */
export declare const ROUTES: {
    readonly HOME: "/";
    readonly TEST: "/test";
    readonly LOGIN: "/login";
    readonly REGISTER: "/register";
    readonly RESET_PASSWORD: "/reset-password";
    readonly DASHBOARD: "/dashboard";
    readonly DASHBOARD_HOME: "/dashboard";
    readonly USERS: "/dashboard/users";
    readonly MEDIA: "/dashboard/media";
    readonly EVENTS: "/dashboard/events";
    readonly PLACES: "/dashboard/places";
    readonly CATEGORIES: "/dashboard/categories";
    readonly STATIC_PAGES: "/dashboard/static-pages";
    readonly SOCIAL: "/dashboard/settings/social";
    readonly SITE_SETTINGS: "/dashboard/settings/site";
    readonly VIDEO_SETTINGS: "/dashboard/settings/video";
    readonly HEADER_MENU: "/dashboard/settings/header";
    readonly LLM_SETTINGS: "/dashboard/settings/llm";
};
/**
 * API Configuration
 */
export declare const API_CONFIG: {
    readonly BASE_URL: any;
    readonly HEALTH_CHECK_URL: any;
    readonly TIMEOUT: 30000;
};
export declare const HEALTH_CHECK_URL: any;
/**
 * Application Configuration
 */
export declare const APP_CONFIG: {
    readonly NAME: "Gaudeix Backoffice";
    readonly FRONTEND_URL: any;
    readonly PAGINATION: {
        readonly DEFAULT_PAGE_SIZE: 10;
        readonly PAGE_SIZE_OPTIONS: readonly [5, 10, 20, 50, 100];
    };
    readonly EVENTS: {
        readonly PAGE_SIZE_DEFAULT: number;
    };
};
/**
 * Storage Keys
 */
export declare const STORAGE_KEYS: {
    readonly AUTH_TOKEN: "auth_token";
    readonly REFRESH_TOKEN: "refresh_token";
    readonly USER: "user";
    readonly THEME: "theme";
};
/**
 * Query Keys for React Query
 */
export declare const QUERY_KEYS: {
    readonly AUTH: {
        readonly USER: readonly ["auth", "user"];
        readonly SESSION: readonly ["auth", "session"];
    };
    readonly USERS: {
        readonly LIST: readonly ["users", "list"];
        readonly DETAIL: (id: string) => string[];
    };
    readonly MEDIA: {
        readonly LIST: readonly ["media", "list"];
        readonly DETAIL: (id: string) => string[];
    };
    readonly EVENTS: {
        readonly LIST: readonly ["events", "list"];
        readonly DETAIL: (id: string) => string[];
    };
    readonly PLACES: {
        readonly LIST: readonly ["places", "list"];
        readonly DETAIL: (id: string) => string[];
    };
    readonly STATIC_PAGES: {
        readonly LIST: readonly ["static-pages", "list"];
        readonly DETAIL: (id: string) => string[];
    };
    readonly CATEGORIES: {
        readonly LIST: readonly ["categories", "list"];
        readonly DETAIL: (id: string) => string[];
    };
    readonly TAGS: {
        readonly LIST: readonly ["tags", "list"];
        readonly DETAIL: (id: string) => string[];
    };
    readonly SOCIAL: {
        readonly LIST: readonly ["social", "list"];
        readonly DETAIL: (id: string) => string[];
    };
};
/**
 * API Endpoints
 */
export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login/";
        readonly REGISTER: "/auth/register/";
        readonly LOGOUT: "/auth/logout/";
        readonly REFRESH: "/auth/token/refresh/";
        readonly ME: "/auth/user/";
        readonly PASSWORD_RESET: "/auth/password/reset/";
        readonly PASSWORD_RESET_CONFIRM: "/auth/password/reset/confirm/";
    };
    readonly USERS: {
        readonly LIST: "/users/";
        readonly DETAIL: (id: string) => string;
    };
    readonly MEDIA: {
        readonly LIST: "/media/";
        readonly DETAIL: (id: string) => string;
        readonly UPLOAD: "/media/upload/";
    };
    readonly EVENTS: {
        readonly LIST: "/events/";
        readonly DETAIL: (id: string) => string;
    };
    readonly PLACES: {
        readonly LIST: "/places/";
        readonly DETAIL: (id: string) => string;
        readonly AUTO_TRANSLATE: (id: string) => string;
    };
    readonly STATIC_PAGES: {
        readonly LIST: "/static-pages/";
        readonly DETAIL: (id: string) => string;
        readonly AUTO_TRANSLATE: (id: string) => string;
    };
    readonly CATEGORIES: {
        readonly LIST: "/categories/";
        readonly DETAIL: (id: string) => string;
        readonly AUTO_TRANSLATE: (id: string) => string;
    };
    readonly TAGS: {
        readonly LIST: "/tags/";
        readonly DETAIL: (id: string) => string;
    };
    readonly SOCIAL: {
        readonly LIST: "/social-links/";
        readonly DETAIL: (id: string) => string;
    };
    readonly MENU_ITEMS: {
        readonly LIST: "/menu-items/";
        readonly DETAIL: (id: string) => string;
    };
    readonly LLM: {
        readonly CONFIG: "/llm-config/";
        readonly TRANSLATE: "/llm-config/translate/";
        readonly AUTO_TRANSLATE_EVENT: (id: string) => string;
        readonly LOGS: "/translation-logs/";
    };
};
/**
 * Supported Languages with Flags
 */
export declare const LANGUAGES: readonly [{
    readonly code: "ca";
    readonly name: "Català";
    readonly flag: "🇦🇩";
}, {
    readonly code: "es";
    readonly name: "Español";
    readonly flag: "🇪🇸";
}, {
    readonly code: "en";
    readonly name: "English";
    readonly flag: "🇬🇧";
}, {
    readonly code: "fr";
    readonly name: "Français";
    readonly flag: "🇫🇷";
}];
