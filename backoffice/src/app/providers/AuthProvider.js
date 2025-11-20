import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("auth_token"));
    const [isLoading, setIsLoading] = useState(false);
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await apiClient.post('/auth/login', { email, password })
            // Placeholder: simulate login
            const mockUser = {
                id: "1",
                email,
                name: "Admin User",
                role: "admin",
            };
            const mockToken = "mock-jwt-token";
            setUser(mockUser);
            setToken(mockToken);
            localStorage.setItem("auth_token", mockToken);
            localStorage.setItem("user", JSON.stringify(mockUser));
        }
        catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
    };
    const value = {
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
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
