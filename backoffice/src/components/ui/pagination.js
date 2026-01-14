import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { Button } from "./button";
export function Pagination({ page, totalPages, onPageChange, className, }) {
    const prevDisabled = page <= 1;
    const nextDisabled = page >= totalPages;
    return (_jsxs("div", { className: cn("inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-2 py-1 shadow-sm backdrop-blur", className), children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-8 rounded-full px-3 text-xs hover:bg-primary/10 dark:hover:bg-primary/20", onClick: () => onPageChange(page - 1), disabled: prevDisabled, children: "Anterior" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [page, " / ", totalPages || 1] }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-8 rounded-full px-3 text-xs hover:bg-primary/10 dark:hover:bg-primary/20", onClick: () => onPageChange(page + 1), disabled: nextDisabled, children: "Siguiente" })] }));
}
