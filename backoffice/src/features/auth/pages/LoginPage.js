import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../components/AuthCard";
import { useAuthForm } from "../hooks/useAuthForm";
import { LOGIN_URL } from "@/config/env";
import { UserPlus, KeyRound } from "lucide-react";
const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});
export const LoginPage = () => {
    const { values, errors, isSubmitting, handleChange, handleSubmit } = useAuthForm({
        schema: loginSchema,
        defaultValues: { email: "", password: "" },
        onSubmit: async (data) => {
            console.log("Login attempt:", data);
            console.log("Target URL:", LOGIN_URL);
            // Placeholder for actual login logic
        },
    });
    return (_jsx(AuthCard, { title: "Bienvenido", subtitle: "Accede a tu cuenta", footer: _jsxs("div", { className: "space-y-3 w-full", children: [_jsxs(Link, { to: "/register", className: "group flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-all duration-200 font-medium", children: [_jsx(UserPlus, { className: "w-4 h-4 transition-transform group-hover:scale-110" }), _jsxs("span", { children: ["\u00BFNo tienes cuenta?", " ", _jsx("span", { className: "underline decoration-2 underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 group-hover:decoration-primary", children: "Reg\u00EDstrate" })] })] }), _jsxs(Link, { to: "/reset-password", className: "group flex items-center justify-center gap-2 text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all duration-200 text-sm", children: [_jsx(KeyRound, { className: "w-3.5 h-3.5 transition-transform group-hover:scale-110" }), _jsx("span", { className: "group-hover:underline underline-offset-4", children: "Olvid\u00E9 mi contrase\u00F1a" })] })] }), children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5 sm:space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Correo electr\u00F3nico" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "tu@email.com", value: values.email, onChange: handleChange, className: "h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30" }), errors.email && (_jsx("p", { className: "text-sm text-destructive mt-1.5", children: errors.email }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Contrase\u00F1a" }), _jsx(Input, { id: "password", name: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: values.password, onChange: handleChange, className: "h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30" }), errors.password && (_jsx("p", { className: "text-sm text-destructive mt-1.5", children: errors.password }))] }), _jsx(Button, { type: "submit", className: "w-full h-10 sm:h-11 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]", disabled: isSubmitting, children: isSubmitting ? "Cargando..." : "Ingresar" })] }) }));
};
