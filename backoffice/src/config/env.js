import { z } from "zod";
const envSchema = z.object({
    VITE_BACKEND_URL: z.string().url().default("http://localhost:8000"),
    VITE_API_AUTH_LOGIN: z.string().default("/auth/login/"),
    VITE_API_AUTH_REGISTER: z.string().default("/auth/register/"),
    VITE_API_AUTH_RESET: z.string().default("/auth/password/reset/"),
});
const env = envSchema.parse(import.meta.env);
export const BACKEND_URL = env.VITE_BACKEND_URL;
export const LOGIN_URL = `${BACKEND_URL}${env.VITE_API_AUTH_LOGIN}`;
export const REGISTER_URL = `${BACKEND_URL}${env.VITE_API_AUTH_REGISTER}`;
export const RESET_URL = `${BACKEND_URL}${env.VITE_API_AUTH_RESET}`;
