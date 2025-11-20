import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
/**
 * DashboardLayout provides the main structure for the dashboard:
 * - Fixed sidebar on the left
 * - Header at the top
 * - Main content area with scroll
 */
export function DashboardLayout() {
    return (_jsxs("div", { className: "flex h-screen overflow-hidden bg-gray-50", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-y-auto p-6", children: _jsx(Outlet, {}) })] })] }));
}
