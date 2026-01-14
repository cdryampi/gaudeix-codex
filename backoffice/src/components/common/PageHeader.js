import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PageHeader - Supabase-style minimalist header
 * Clean typography with subtle spacing
 */
export function PageHeader({ title, description, actions }) {
    return (_jsxs("div", { className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-2xl font-semibold tracking-tight text-foreground", children: title }), description && (_jsx("p", { className: "text-sm text-muted-foreground", children: description }))] }), actions && (_jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions }))] }));
}
