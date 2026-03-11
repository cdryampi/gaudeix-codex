/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "react/jsx-runtime",
        replacement: path.resolve(
          __dirname,
          "./node_modules/react/jsx-runtime.js",
        ),
      },
      {
        find: "react-dom",
        replacement: path.resolve(__dirname, "./node_modules/react-dom"),
      },
      {
        find: "react",
        replacement: path.resolve(__dirname, "./node_modules/react"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: "@frontend",
        replacement: path.resolve(__dirname, "../frontend/src"),
      },
      {
        find: /.*\.css$/,
        replacement: path.resolve(__dirname, "./src/tests/empty.css"),
      },
    ],
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
