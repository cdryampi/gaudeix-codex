import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@frontend", replacement: path.resolve(__dirname, "../frontend/src") },
      { find: /.*\.css$/, replacement: path.resolve(__dirname, "./src/tests/empty.css") }
    ]
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
  },
});
