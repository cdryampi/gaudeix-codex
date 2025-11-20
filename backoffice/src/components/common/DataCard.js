import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
/**
 * DataCard displays a metric with optional icon and trend
 */
export function DataCard({ title, value, description, icon: Icon, trend, }) {
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: title }), Icon && _jsx(Icon, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: value }), description && (_jsx("p", { className: "text-xs text-muted-foreground", children: description })), trend && (_jsxs("p", { className: `text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`, children: [trend.isPositive ? "+" : "", trend.value, "% desde el mes pasado"] }))] })] }));
}
