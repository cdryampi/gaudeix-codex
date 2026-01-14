/**
 * Auth API Service
 *
 * API calls for authentication: login, registration, password reset.
 */

import { apiPost, apiGet } from "@/lib/api";
import type {
  User,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  ApiError,
} from "./types";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>("/users/login/", credentials);
  return response;
}

export async function register(data: RegisterData): Promise<User> {
  const response = await apiPost<User>("/users/", data);
  return response;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiGet<User>("/users/me/");
  return response;
}

export async function requestPasswordReset(data: PasswordResetRequest): Promise<{ detail: string }> {
  const response = await apiPost<{ detail: string }>("/users/password-reset/", data);
  return response;
}

export async function confirmPasswordReset(data: PasswordResetConfirm): Promise<{ detail: string }> {
  const response = await apiPost<{ detail: string }>("/users/password-reset-confirm/", data);
  return response;
}

export function formatApiError(error: unknown): string {
  if (error && typeof error === "object" && "detail" in error) {
    return String(error.detail);
  }

  if (error && typeof error === "object") {
    const apiError = error as ApiError;
    const errors: string[] = [];

    if (apiError.non_field_errors) {
      errors.push(...apiError.non_field_errors);
    }

    for (const field in apiError) {
      if (Array.isArray(apiError[field as keyof ApiError])) {
        errors.push(...(apiError[field as keyof ApiError] as string[]));
      }
    }

    if (errors.length > 0) {
      return errors.join(". ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
}
