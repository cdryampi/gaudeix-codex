import { useState, ReactNode, useEffect } from "react";
import type { User } from "@/types";
import { authApi } from "@/features/auth/api";
import { authStorage } from "@/lib/storage/authStorage";
import { LoginCredentials } from "@/types";
import { AuthContext, AuthContextType } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    authStorage.getAccessToken(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const logout = () => {
    authApi.logout();
    authStorage.clear();
    setUser(null);
    setToken(null);
  };

  // Restore user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authStorage.getAccessToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authApi.getCurrentUser();
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.username,
            role: userData.is_staff ? "admin" : "user",
            username: userData.username,
          });
        } catch (error) {
          console.error("Failed to restore session:", error);
          logout();
        }
      }
      setIsRestoringSession(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const userData = await authApi.getCurrentUser();

      const userObj: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.username,
        role: userData.is_staff ? "admin" : "user",
        username: userData.username,
      };

      setUser(userObj);
      setToken(response.access);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    isLoading,
    isRestoringSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
