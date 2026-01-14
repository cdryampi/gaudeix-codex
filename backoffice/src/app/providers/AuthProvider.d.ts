import { ReactNode } from "react";
import type { AuthState } from "@/types";
import { LoginCredentials } from "@/types";
interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isRestoringSession: boolean;
}
interface AuthProviderProps {
    children: ReactNode;
}
export declare function AuthProvider({ children }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const useAuth: () => AuthContextType;
export {};
