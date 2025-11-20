import { ReactNode } from "react";
import type { AuthState } from "@/types";
interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}
interface AuthProviderProps {
    children: ReactNode;
}
export declare function AuthProvider({ children }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const useAuth: () => AuthContextType;
export {};
