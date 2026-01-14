import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
/**
 * PageContainer - Consistent spacing for all pages
 * Removed from this component since DashboardLayout handles it
 */
export function PageContainer({ children, className }) {
    return _jsx("div", { className: cn("space-y-6", className), children: children });
}
