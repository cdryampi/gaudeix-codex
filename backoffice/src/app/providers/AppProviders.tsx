import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders wraps the entire application with all necessary providers.
 * Order matters: Theme → Auth → Query
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="backoffice-theme">
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
