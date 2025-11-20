import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Image, Calendar } from "lucide-react";
import { ROUTES } from "@/lib/config/constants";
const navigation = [
    { name: "Dashboard", href: ROUTES.DASHBOARD_HOME, icon: LayoutDashboard },
    { name: "Usuarios", href: ROUTES.USERS, icon: Users },
    { name: "Media", href: ROUTES.MEDIA, icon: Image },
    { name: "Eventos", href: ROUTES.EVENTS, icon: Calendar },
];
export function Sidebar() {
    const location = useLocation();
    return (_jsxs("div", { className: "flex h-full w-64 flex-col bg-gray-900", children: [_jsx("div", { className: "flex h-16 items-center px-6", children: _jsx("h1", { className: "text-xl font-bold text-white", children: "Gaudeix" }) }), _jsx("nav", { className: "flex-1 space-y-1 px-3 py-4", children: navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (_jsxs(Link, { to: item.href, className: cn("group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive
                            ? "bg-gray-800 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"), children: [_jsx(item.icon, { className: cn("mr-3 h-5 w-5 flex-shrink-0", isActive
                                    ? "text-white"
                                    : "text-gray-400 group-hover:text-white") }), item.name] }, item.name));
                }) }), _jsx("div", { className: "border-t border-gray-800 p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-gray-700" }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-white", children: "Admin User" }), _jsx("p", { className: "text-xs text-gray-400", children: "admin@gaudeix.com" })] })] }) })] }));
}
