import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu, Bell, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export function Header({ onMenuClick }) {
    const { user, logout } = useAuth();
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };
    return (_jsxs("header", { className: "sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-gray-200 bg-white px-6 dark:bg-gray-900 dark:border-gray-800", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "lg:hidden -ml-2", onClick: onMenuClick, children: _jsx(Menu, { className: "h-5 w-5" }) }), _jsx("div", { className: "flex-1 flex items-center gap-4 md:gap-8", children: _jsxs("div", { className: "relative flex-1 max-w-md hidden md:block", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" }), _jsx(Input, { type: "search", placeholder: "Buscar...", className: "w-full bg-gray-50 pl-9 dark:bg-gray-800" })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "icon", className: "relative", children: [_jsx(Bell, { className: "h-5 w-5 text-gray-600 dark:text-gray-400" }), _jsx("span", { className: "absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-9 w-9 rounded-full", children: _jsxs(Avatar, { className: "h-9 w-9 border border-gray-200 dark:border-gray-700", children: [_jsx(AvatarImage, { src: "", alt: user?.name }), _jsx(AvatarFallback, { className: "bg-primary/10 text-primary", children: user?.name ? getInitials(user.name) : "AD" })] }) }) }), _jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: user?.name }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user?.email })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { children: [_jsx(UserIcon, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Perfil" })] }), _jsx(DropdownMenuItem, { children: "Settings" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { className: "text-red-600 focus:text-red-600", onClick: logout, children: "Cerrar Sesi\u00F3n" })] })] })] })] }));
}
