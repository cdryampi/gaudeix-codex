const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (import.meta.env.DEV && !apiBaseUrl) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL is not defined. Some API calls may fail.");
}
export const apiConfig = {
  baseUrl: apiBaseUrl,
};
export default apiConfig;
