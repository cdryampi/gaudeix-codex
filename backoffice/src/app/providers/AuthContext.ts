import { createContext } from "react";
import type { AuthState } from "@/types";
import { LoginCredentials } from "@/types";

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isRestoringSession: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
