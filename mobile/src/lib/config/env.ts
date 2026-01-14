/**
 * Environment Configuration
 * 
 * Provides typed access to environment variables with validation
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

interface EnvConfig {
  apiBaseUrl: string;
  env: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export const envConfig: EnvConfig = {
  apiBaseUrl: API_BASE_URL,
  env: ENV,
  isDevelopment: ENV === 'development',
  isProduction: ENV === 'production',
};

/**
 * Validate environment configuration
 */
export function validateEnv(): void {
  if (!envConfig.apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required');
  }
}

// Validate on import
validateEnv();
