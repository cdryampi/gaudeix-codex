import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { LogOut, User, Server, Globe, MonitorSmartphone, Moon, Sun, } from "lucide-react";
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
    return (_jsxs("header", { className: "flex h-14 items-center justify-between border-b border-border bg-background px-6", children: [_jsx("div", { className: "flex items-center gap-3", children: _jsx("h1", { className: "text-sm font-medium text-foreground" }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { variant: "outline", className: "gap-1.5 border-primary/20 bg-primary/5 text-xs font-normal text-primary hover:bg-primary/5", children: [_jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary" }), "producci\u00F3n"] }), _jsx("div", { className: "h-4 w-px bg-border" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx(Server, { className: "h-3.5 w-3.5" }), _jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary" })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx(Globe, { className: "h-3.5 w-3.5" }), _jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary" })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx(MonitorSmartphone, { className: "h-3.5 w-3.5" }), _jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary" })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [user && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(User, { className: "h-4 w-4" }), _jsx("span", { children: user.email || user.username })] })), _jsxs(Button, { variant: "ghost", size: "icon", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), className: "h-8 w-8 text-muted-foreground hover:text-foreground", children: [theme === "dark" ? (_jsx(Sun, { className: "h-4 w-4" })) : (_jsx(Moon, { className: "h-4 w-4" })), _jsx("span", { className: "sr-only", children: "Cambiar tema" })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: logout, className: "gap-2 text-muted-foreground hover:text-foreground", children: [_jsx(LogOut, { className: "h-4 w-4" }), "Salir"] })] })] }));
}
