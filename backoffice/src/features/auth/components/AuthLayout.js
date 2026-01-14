import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
/**
 * AuthLayout provides a centered, compact layout for authentication pages
 */
export const AuthLayout = () => {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 px-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("header", { className: "mb-10 flex items-center justify-around", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/assets/img/logo-cabrera-white.png", alt: "Gaudeix", className: "h-10 w-auto invert dark:invert-0" }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold", children: "Gaudeix" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Backoffice" })] })] }), _jsx(ThemeToggle, {})] }), _jsx("div", { className: "bg-card border rounded-xl shadow-lg p-6", children: _jsx(Outlet, {}) }), _jsx("p", { className: "text-center text-xs text-muted-foreground mt-6", children: "\u00A9 2025 Gaudeix Municipal" })] }) }));
};
