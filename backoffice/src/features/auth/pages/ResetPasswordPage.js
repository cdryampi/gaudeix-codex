import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../components/AuthCard";
import { useAuthForm } from "../hooks/useAuthForm";
import { API_CONFIG, API_ENDPOINTS } from "@/lib/config/constants";
import { ArrowLeft } from "lucide-react";
const resetSchema = z.object({
    email: z.string().email("Email inválido"),
});
export const ResetPasswordPage = () => {
    const { values, errors, isSubmitting, handleChange, handleSubmit } = useAuthForm({
        schema: resetSchema,
        defaultValues: { email: "" },
        onSubmit: async (data) => {
            console.log("Reset password attempt:", data);
            console.log("Target URL:", `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`);
            // Placeholder for actual reset logic
        },
    });
    return (_jsx(AuthCard, { title: "Recuperar Contrase\u00F1a", subtitle: "Te enviaremos instrucciones a tu correo", footer: _jsxs(Link, { to: "/login", className: "group flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-all duration-200 font-medium", children: [_jsx(ArrowLeft, { className: "w-4 h-4 transition-transform group-hover:-translate-x-1" }), _jsx("span", { className: "underline decoration-2 underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 group-hover:decoration-primary", children: "Volver al inicio de sesi\u00F3n" })] }), children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5 sm:space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Correo electr\u00F3nico" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "tu@email.com", value: values.email, onChange: handleChange, className: "h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30" }), errors.email && (_jsx("p", { className: "text-sm text-destructive mt-1.5", children: errors.email }))] }), _jsx(Button, { type: "submit", className: "w-full h-10 sm:h-11 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]", disabled: isSubmitting, children: isSubmitting ? "Cargando..." : "Enviar instrucciones" })] }) }));
};
