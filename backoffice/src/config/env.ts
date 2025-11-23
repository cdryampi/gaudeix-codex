import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default("http://localhost:8000/api"),
  VITE_API_AUTH_LOGIN: z.string().default("/auth/login/"),
  VITE_API_AUTH_REGISTER: z.string().default("/auth/register/"),
  VITE_API_AUTH_RESET: z.string().default("/auth/password/reset/"),
  VITE_ADMIN_USER: z.string().email().optional(),
  VITE_ADMIN_PASSWORD: z.string().optional(),
  VITE_SYSTEM_USER: z.string().email().optional(),
  VITE_SYSTEM_PASSWORD: z.string().optional(),
});

const env = envSchema.parse(import.meta.env);

export const BACKEND_URL = env.VITE_API_BASE_URL;
export const LOGIN_URL = `${BACKEND_URL}${env.VITE_API_AUTH_LOGIN}`;
export const REGISTER_URL = `${BACKEND_URL}${env.VITE_API_AUTH_REGISTER}`;
export const RESET_URL = `${BACKEND_URL}${env.VITE_API_AUTH_RESET}`;

export const ADMIN_USER = env.VITE_ADMIN_USER;
export const ADMIN_PASSWORD = env.VITE_ADMIN_PASSWORD;
export const SYSTEM_USER = env.VITE_SYSTEM_USER;
export const SYSTEM_PASSWORD = env.VITE_SYSTEM_PASSWORD;
