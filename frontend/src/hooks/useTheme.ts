import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return defaultTheme;
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark");

      if (currentTheme === "system") {
        const systemDark =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.add(systemDark ? "dark" : "light");
      } else {
        root.classList.add(currentTheme);
      }
    };

    applyTheme(theme);

    // Listener de preferencias del sistema
    const mediaQuery =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    const handleSystemChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    if (mediaQuery) {
      mediaQuery.addEventListener("change", handleSystemChange);
    }

    // Listener de sincronización inter-pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        const val = e.newValue as Theme;
        if (val === "light" || val === "dark" || val === "system") {
          setThemeState(val);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener("change", handleSystemChange);
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [theme, storageKey]);

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, setTheme } },
    children,
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
