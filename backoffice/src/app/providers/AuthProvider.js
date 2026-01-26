import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/features/auth/api";
import { authStorage } from "@/lib/storage/authStorage";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authStorage.getAccessToken());
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
          // If we have a token but no user, fetch user data
          // For now, we assume if we have a token, we are somewhat authenticated
          // Ideally, we should validate the token or fetch user profile here
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
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      // Fetch user profile after successful login
      // Note: The login response might not include full user details depending on backend
      // Adjust this based on actual backend response or fetch user separately
      // Assuming response contains user object or we fetch it
      // Let's fetch it to be sure
      const userData = await authApi.getCurrentUser();
      const userObj = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.username,
        role: userData.is_staff ? "admin" : "user",
        username: userData.username,
      };
      setUser(userObj);
      setToken(response.access);
      // Tokens are already stored by authApi.login -> authStorage.setTokens
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    isLoading,
    isRestoringSession,
  };
  return _jsx(AuthContext.Provider, { value: value, children: children });
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
