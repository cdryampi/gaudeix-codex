import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    {
        extends: "./frontend/vite.config.ts",
        test: {
            name: "frontend",
            environment: "jsdom",
            root: "./frontend",
        },
    },
    {
        extends: "./backoffice/vite.config.ts",
        test: {
            name: "backoffice",
            environment: "jsdom",
            root: "./backoffice",
        },
    },
]);
