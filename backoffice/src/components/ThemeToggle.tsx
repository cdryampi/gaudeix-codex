import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "flowbite-react";
import { useTheme } from "@/app/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        color="gray"
        size="sm"
        className={`p-2 ${theme === "light" ? "bg-white shadow-sm" : ""}`}
        onClick={() => setTheme("light")}
        aria-label="Claro"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        color="gray"
        size="sm"
        className={`p-2 ${theme === "dark" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
        onClick={() => setTheme("dark")}
        aria-label="Oscuro"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        color="gray"
        size="sm"
        className={`p-2 ${theme === "system" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
        onClick={() => setTheme("system")}
        aria-label="Sistema"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
