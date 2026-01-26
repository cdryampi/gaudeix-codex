/**
 * Environment Configuration
 * Provides typed access to environment variables
 */
/**
 * Environment variables configuration
 */
export declare const envConfig: {
  readonly apiBaseUrl: any;
  readonly healthCheckUrl: any;
  readonly frontendUrl: any;
  readonly testCredentials: {
    readonly adminUser: any;
    readonly adminPassword: any;
    readonly systemUser: any;
    readonly systemPassword: any;
  };
  readonly events: {
    readonly pageSizeDefault: number;
  };
  readonly googleMapsApiKey: any;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly mode: string;
};
/**
 * Type-safe environment variable access
 */
export type EnvConfig = typeof envConfig;
/**
 * Validate required environment variables
 */
export declare function validateEnv(): void;
