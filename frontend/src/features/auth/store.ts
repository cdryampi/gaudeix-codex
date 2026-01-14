/**
 * Auth Store (Zustand)
 *
 * Global state management for authentication.
 * Persists tokens and user data to localStorage.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState } from "./types";
import { login as apiLogin, register as apiRegister, getCurrentUser } from "./api";

const STORAGE_KEY = "gaudeix_auth";

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; name: string; password: string; password_confirm: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setError: (error: string | null) => void;
}

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
          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";
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
          const user = await apiRegister(data);
          // After registration, automatically login
          const response = await apiLogin({ username: data.username, password: data.password });
          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error al registrar usuario";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshUser: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          set({ user, isLoading: false });
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
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
    }
  )
);
