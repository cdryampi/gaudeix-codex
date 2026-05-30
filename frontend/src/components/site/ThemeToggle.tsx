import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  isTransparent?: boolean;
}

export function ThemeToggle({
  className,
  isTransparent = false,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isTransparent
          ? "bg-white/10 text-white hover:bg-white/20 hover:scale-105"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
        className,
      )}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className="relative h-5 w-5 overflow-hidden">
        {/* Icono de Sol */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 transform",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100",
          )}
        >
          <Sun className="h-5 w-5" />
        </span>
        {/* Icono de Luna */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 transform",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        >
          <Moon className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}
