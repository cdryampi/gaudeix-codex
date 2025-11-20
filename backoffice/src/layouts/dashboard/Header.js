import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
import { LogOut } from "lucide-react";
export function Header() {
    const { logout } = useAuth();
    return (_jsxs("header", { className: "flex h-16 items-center justify-between border-b bg-white px-6", children: [_jsx("div", { children: _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Dashboard" }) }), _jsx("div", { className: "flex items-center gap-4", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: logout, className: "gap-2", children: [_jsx(LogOut, { className: "h-4 w-4" }), "Cerrar sesi\u00F3n"] }) })] }));
}
