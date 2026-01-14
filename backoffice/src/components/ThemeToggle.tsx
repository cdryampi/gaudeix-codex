import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${theme === "light" ? "bg-background shadow-sm" : ""}`}
        onClick={() => setTheme("light")}
        aria-label="Claro"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${theme === "dark" ? "bg-background shadow-sm" : ""}`}
        onClick={() => setTheme("dark")}
        aria-label="Oscuro"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${theme === "system" ? "bg-background shadow-sm" : ""}`}
        onClick={() => setTheme("system")}
        aria-label="Sistema"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
