import { jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
/**
 * AuthLayout provides a simple centered layout for authentication pages
 */
export function AuthLayout() {
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-100", children: _jsx("div", { className: "w-full max-w-md", children: _jsx(Outlet, {}) }) }));
}
