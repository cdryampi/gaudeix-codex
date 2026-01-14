import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { User, AuthState } from "@/types";
import { authApi } from "@/features/auth/api";
import { authStorage } from "@/lib/storage/authStorage";
import { LoginCredentials } from "@/types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isRestoringSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getAccessToken());
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
            role: userData.is_staff ? 'admin' : 'user',
            username: userData.username
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
      
      // Fetch user profile after successful login
      // Note: The login response might not include full user details depending on backend
      // Adjust this based on actual backend response or fetch user separately
      
      // Assuming response contains user object or we fetch it
      // Let's fetch it to be sure
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
      
      // Tokens are already stored by authApi.login -> authStorage.setTokens
    } catch (error: any) {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
