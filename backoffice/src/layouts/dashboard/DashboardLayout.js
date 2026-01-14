import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex min-h-screen bg-gray-50 dark:bg-gray-950", children: [_jsx(Sidebar, { isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsxs("div", { className: "flex flex-1 flex-col transition-all duration-200 ease-in-out w-full", children: [_jsx(Header, { onMenuClick: () => setIsSidebarOpen(true) }), _jsx("main", { className: "flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8", children: _jsx("div", { className: "mx-auto max-w-7xl animate-in fade-in duration-500", children: _jsx(Outlet, {}) }) })] })] }));
}
