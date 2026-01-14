import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
export function EventsFilters({ search, onSearch, status, onStatus, pageSize, onPageSize, }) {
    const tabs = [
        { value: "all", label: "Todos" },
        { value: "published", label: "Publicados" },
        { value: "draft", label: "Borradores" },
    ];
    return (_jsxs("div", { className: "mb-6 space-y-3", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "relative w-full sm:w-3/4", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Buscar eventos...", value: search, onChange: (e) => onSearch(e.target.value), className: "pl-9" })] }), _jsxs("div", { className: "flex items-center gap-2 sm:justify-end", children: [_jsx(Label, { htmlFor: "pageSize", className: "text-xs text-muted-foreground", children: "Mostrar:" }), _jsx("select", { id: "pageSize", value: pageSize, onChange: (e) => onPageSize(Number(e.target.value)), className: "h-9 rounded-lg border border-border bg-card px-3 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20", children: [5, 10, 20, 50].map((size) => (_jsx("option", { value: size, children: size }, size))) })] })] }), _jsx("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: _jsx("div", { className: "inline-flex gap-1 rounded-lg bg-muted/50 p-1", children: tabs.map((tab) => (_jsx("button", { onClick: () => onStatus(tab.value), className: cn("rounded-md px-3 py-1.5 text-xs font-medium transition-all", status === tab.value
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"), children: tab.label }, tab.value))) }) })] }));
}
