import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, Image as ImageIcon, Settings, X, MapPin, Bell, LogOut, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
const MENU_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Usuarios", path: "/dashboard/users" },
    { icon: Calendar, label: "Eventos", path: "/dashboard/events" },
    { icon: MapPin, label: "Lugares", path: "/dashboard/places" },
    { icon: Bell, label: "Avisos", path: "/dashboard/notifications" },
    { icon: ImageIcon, label: "Media", path: "/dashboard/media" },
    { icon: Settings, label: "Configuración", path: "/dashboard/settings" },
];
export function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { logout } = useAuth();
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 z-40 bg-black/50 lg:hidden", onClick: onClose })), _jsx("aside", { className: cn("fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto", isOpen ? "translate-x-0" : "-translate-x-full"), children: _jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("div", { className: "flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800", children: [_jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2", children: [_jsx("div", { className: "h-8 w-8 rounded-lg bg-primary flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-lg", children: "G" }) }), _jsx("span", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "Gaudeix" })] }), _jsx(Button, { variant: "ghost", size: "icon", className: "lg:hidden", onClick: onClose, children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-1", children: MENU_ITEMS.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (_jsxs(Link, { to: item.path, className: cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", isActive
                                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"), onClick: () => window.innerWidth < 1024 && onClose(), children: [_jsx(item.icon, { className: "h-5 w-5" }), item.label] }, item.path));
                            }) }), _jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-800", children: _jsxs(Button, { variant: "ghost", className: "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20", onClick: logout, children: [_jsx(LogOut, { className: "mr-2 h-5 w-5" }), "Cerrar Sesi\u00F3n"] }) })] }) })] }));
}
