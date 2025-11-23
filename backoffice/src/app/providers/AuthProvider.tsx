import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { User, AuthState } from "@/types";
import { authService } from "@/lib/api/auth";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );
  const [isLoading, setIsLoading] = useState(false);

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
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
      localStorage.setItem("auth_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      localStorage.setItem("user", JSON.stringify(userObj));
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
