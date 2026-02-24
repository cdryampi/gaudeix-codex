import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@frontend": path.resolve(__dirname, "../frontend/src"),
    },
  },
  test: {
    environment: "jsdom",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@frontend": path.resolve(__dirname, "../frontend/src"),
      },
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
