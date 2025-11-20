import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
/**
 * PageContainer provides consistent padding and max-width for pages
 */
export function PageContainer({ children, className }) {
    return (_jsx("div", { className: cn("mx-auto w-full max-w-7xl", className), children: children }));
}
