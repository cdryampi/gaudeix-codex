import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider as FlowbiteThemeProvider } from "flowbite-react";
import { customTheme } from "@/theme/flowbiteTheme";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders wraps the entire application with all necessary providers.
 * Order matters: Theme → Auth → Query
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <FlowbiteThemeProvider theme={{ theme: customTheme }}>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </FlowbiteThemeProvider>
    </ThemeProvider>
  );
}
