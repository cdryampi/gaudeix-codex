import { jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from "@/app/providers/ThemeProvider";
import { Toaster as Sonner } from "sonner";
const Toaster = ({ ...props }) => {
    const { theme = "system" } = useTheme();
    return (_jsx(Sonner, { theme: theme, className: "toaster group", position: "top-right", expand: true, richColors: true, toastOptions: {
            classNames: {
                toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-sm",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80",
                success: "group-[.toaster]:bg-primary/10 group-[.toaster]:border-primary/20 group-[.toaster]:text-foreground [&>svg]:text-primary",
                error: "group-[.toaster]:bg-destructive/10 group-[.toaster]:border-destructive/20 group-[.toaster]:text-foreground [&>svg]:text-destructive",
                warning: "group-[.toaster]:bg-yellow-500/10 group-[.toaster]:border-yellow-500/20 group-[.toaster]:text-foreground [&>svg]:text-yellow-500",
                info: "group-[.toaster]:bg-blue-500/10 group-[.toaster]:border-blue-500/20 group-[.toaster]:text-foreground [&>svg]:text-blue-500",
            },
        }, ...props }));
};
export { Toaster };
