/**
 * Environment Configuration
 * Provides typed access to environment variables
 */

/**
 * Environment variables configuration
 */
export const envConfig = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  healthCheckUrl: import.meta.env.VITE_HEALTH_CHECK_URL || "http://localhost:8000/api/health/",
  
  // Frontend URL
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
  
  // Test credentials (DO NOT USE IN PRODUCTION)
  testCredentials: {
    adminUser: import.meta.env.VITE_ADMIN_USER || "",
    adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || "",
    systemUser: import.meta.env.VITE_SYSTEM_USER || "",
    systemPassword: import.meta.env.VITE_SYSTEM_PASSWORD || "",
  },
  
  // Events configuration
  events: {
    pageSizeDefault: Number(import.meta.env.VITE_EVENTS_PAGE_SIZE_DEFAULT) || 5,
  },

  // Google Maps
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  
  // Environment info
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

/**
 * Type-safe environment variable access
 */
export type EnvConfig = typeof envConfig;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required = [
    "VITE_API_BASE_URL",
  ];

  const missing = required.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(", ")}\n` +
      "Some features may not work correctly. Check your .env.local file."
    );
  }
}
