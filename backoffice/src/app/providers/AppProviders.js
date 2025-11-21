import { jsx as _jsx } from "react/jsx-runtime";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
/**
 * AppProviders wraps the entire application with all necessary providers.
 * Order matters: Theme → Auth → Query
 */
export function AppProviders({ children }) {
    return (_jsx(ThemeProvider, { defaultTheme: "system", storageKey: "backoffice-theme", children: _jsx(AuthProvider, { children: _jsx(QueryProvider, { children: children }) }) }));
}
