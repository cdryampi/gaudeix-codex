import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { User, AuthState } from "@/types";
import { authService } from "@/lib/api/auth";
import { authStorage } from "@/lib/storage/authStorage";

interface AuthContextType extends AuthState {
  login: (
    username: string,
    password: string,
    options?: { remember?: boolean }
  ) => Promise<void>;
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
    authService.logout();
    authStorage.clear();
    setUser(null);
    setToken(null);
  };

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedToken = authStorage.getAccessToken();
    const storedUser = authStorage.getUser();

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(storedUser);
      } else {
        // Token sin usuario guardado: limpiamos para evitar estados inconsistentes
        authStorage.clear();
      }
    }

    setIsRestoringSession(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (
    username: string,
    password: string,
    options?: { remember?: boolean }
  ) => {
    console.log("🔐 Login iniciado con:", { username });
    setIsLoading(true);
    try {
      console.log("📡 Enviando request al backend...");
      const response = await authService.login({ username, password });
      console.log("✅ Respuesta del backend:", response);

      const userObj: User = {
        id: response.user.id,
        email: response.user.email,
        name:
          response.user.first_name && response.user.last_name
            ? `${response.user.first_name} ${response.user.last_name}`
            : response.user.username,
        role: response.user.is_staff ? "admin" : "user",
      };

      console.log("💾 Guardando usuario:", userObj);
      setUser(userObj);
      setToken(response.access);
      const remember = options?.remember ?? true;
      authStorage.saveSession(
        { access: response.access, refresh: response.refresh },
        userObj,
        remember
      );
      console.log("✅ Login completado exitosamente");
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        "Error al iniciar sesión. Verifica tus credenciales.";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
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
