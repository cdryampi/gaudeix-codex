/**
 * Sonner toast stub - using console for now
 */
export function Toaster() {
  return null;
}
export const toast = {
  success: (message) => console.log("Success:", message),
  error: (message) => console.error("Error:", message),
  info: (message) => console.info("Info:", message),
  warning: (message) => console.warn("Warning:", message),
};
