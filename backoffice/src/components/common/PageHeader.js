import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PageHeader displays the page title, optional description, and action buttons
 */
export function PageHeader({ title, description, actions }) {
    return (_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: title }), description && (_jsx("p", { className: "mt-1 text-sm text-gray-500", children: description }))] }), actions && _jsx("div", { className: "flex gap-2", children: actions })] }));
}
