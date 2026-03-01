const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.DEV && !apiBaseUrl) {

  console.warn("VITE_API_BASE_URL is not defined. Some API calls may fail.");
}

export interface ApiConfig {
  baseUrl: string | undefined;
}

export const apiConfig: ApiConfig = {
  baseUrl: apiBaseUrl,
};

export default apiConfig;
