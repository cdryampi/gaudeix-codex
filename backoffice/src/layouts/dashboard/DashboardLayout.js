import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia)
            return;
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handleChange = () => setIsDesktop(mediaQuery.matches);
        handleChange();
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);
    useEffect(() => {
        if (isDesktop) {
            setIsSidebarOpen(false);
        }
    }, [isDesktop]);
    return (_jsxs("div", { className: "flex min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950", children: [_jsx(Sidebar, { isOpen: isSidebarOpen, isDesktop: isDesktop, onClose: () => setIsSidebarOpen(false) }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col transition-all duration-200 ease-in-out", children: [_jsx(Header, { onMenuClick: () => {
                        if (!isDesktop) {
                            setIsSidebarOpen(true);
                        }
                    }, showMenuButton: !isDesktop }), _jsx("main", { className: "flex-1 min-w-0 overflow-x-auto p-4 md:p-6 lg:p-8", children: _jsx("div", { className: "mx-auto w-full max-w-7xl animate-in fade-in duration-500", children: _jsx(Outlet, {}) }) })] })] }));
}
