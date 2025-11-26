import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  LogOut,
  User,
  Server,
  Globe,
  MonitorSmartphone,
  Moon,
  Sun,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Minimalist header following Supabase design:
 * - Clean, subtle border
 * - System status indicators with icons
 * - Theme toggle
 * - Right-aligned user actions
 */
export function Header() {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      {/* Page title area - can be populated by individual pages */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-foreground">
          {/* Page title will be rendered here via context/props if needed */}
        </h1>
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="gap-1.5 border-primary/20 bg-primary/5 text-xs font-normal text-primary hover:bg-primary/5"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          producción
        </Badge>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Server className="h-3.5 w-3.5" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MonitorSmartphone className="h-3.5 w-3.5" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* User actions */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user.email || user.username}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Cambiar tema</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
