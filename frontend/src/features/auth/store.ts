/**
 * Auth Store (Zustand)
 *
 * Global state management for authentication.
 * Persists tokens and user data to localStorage.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notifications as toast } from "@/lib/notifications";
import type { AuthState } from "./types";
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
} from "./api";
import { ApiRequestError } from "@/lib/api";

const STORAGE_KEY = "gaudeix_auth";
const SESSION_RECOVERY_TOAST_ID = "session-recovery-error";
const SESSION_RECOVERY_ERROR_MESSAGE =
  "No se pudo recuperar tu sesión. Inicia sesión de nuevo.";

let hasShownSessionRecoveryToast = false;

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    name: string;
    password: string;
    password_confirm: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: (options?: { notifyOnFailure?: boolean }) => Promise<void>;
  initializeSession: () => Promise<void>;
  setError: (error: string | null) => void;
}

function shouldForceLogout(error: unknown): boolean {
  if (!(error instanceof ApiRequestError)) {
    return false;
  }

  if (error.isNetworkError) {
    return true;
  }

  if (!error.status) {
    return false;
  }

  return error.status === 401 || error.status === 403 || error.status >= 500;
}

function showSessionRecoveryToast() {
  if (hasShownSessionRecoveryToast) {
    return;
  }

  hasShownSessionRecoveryToast = true;
  toast.error(SESSION_RECOVERY_ERROR_MESSAGE, {
    id: SESSION_RECOVERY_TOAST_ID,
  });
}

const resetAuthState: Pick<
  AuthState,
  | "user"
  | "accessToken"
  | "refreshToken"
  | "isAuthenticated"
  | "isLoading"
  | "error"
> = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiLogin({ username, password });
          hasShownSessionRecoveryToast = false;
          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error al iniciar sesión";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await apiRegister(data);
          // After registration, automatically login
          const response = await apiLogin({
            username: data.username,
            password: data.password,
          });
          hasShownSessionRecoveryToast = false;
          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Error al registrar usuario";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        hasShownSessionRecoveryToast = false;
        set(resetAuthState);
      },

      refreshUser: async (options) => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const user = await getCurrentUser(accessToken);
          hasShownSessionRecoveryToast = false;
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          if (shouldForceLogout(error)) {
            set(resetAuthState);
            if (options?.notifyOnFailure) {
              showSessionRecoveryToast();
            }
            return;
          }

          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "No se pudo actualizar la sesión",
          });
        }
      },

      initializeSession: async () => {
        const { accessToken, refreshUser } = get();
        if (!accessToken) {
          return;
        }

        await refreshUser({ notifyOnFailure: true });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
