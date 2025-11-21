import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../components/AuthCard";
import { useAuthForm } from "../hooks/useAuthForm";
import { REGISTER_URL } from "@/config/env";
import { LogIn } from "lucide-react";
const registerSchema = z
    .object({
    email: z.string().email("Email inválido"),
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    repeat_password: z.string(),
})
    .refine((data) => data.password === data.repeat_password, {
    message: "Las contraseñas no coinciden",
    path: ["repeat_password"],
});
export const RegisterPage = () => {
    const { values, errors, isSubmitting, handleChange, handleSubmit } = useAuthForm({
        schema: registerSchema,
        defaultValues: { email: "", password: "", repeat_password: "" },
        onSubmit: async (data) => {
            console.log("Register attempt:", data);
            console.log("Target URL:", REGISTER_URL);
            // Placeholder for actual register logic
        },
    });
    return (_jsx(AuthCard, { title: "Crear Cuenta", subtitle: "\u00DAnete a nosotros", footer: _jsxs(Link, { to: "/login", className: "group flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-all duration-200 font-medium", children: [_jsx(LogIn, { className: "w-4 h-4 transition-transform group-hover:scale-110" }), _jsxs("span", { children: ["\u00BFYa tienes cuenta?", " ", _jsx("span", { className: "underline decoration-2 underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 group-hover:decoration-primary", children: "Inicia sesi\u00F3n" })] })] }), children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5 sm:space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Correo electr\u00F3nico" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "tu@email.com", value: values.email, onChange: handleChange, className: "h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30" }), errors.email && (_jsx("p", { className: "text-sm text-destructive mt-1.5", children: errors.email }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Contrase\u00F1a" }), _jsx(Input, { id: "password", name: "password", type: "password", placeholder: "M\u00EDnimo 6 caracteres", value: values.password, onChange: handleChange, className: "h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30" }), errors.password && (_jsx("p", { className: "text-sm text-destructive mt-1.5", children: errors.password }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "repeat_password", className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Confirmar Contrase\u00F1a" }), _jsx(Input, { id: "repeat_password", name: "repeat_password", type: "password", placeholder: "Repite tu contrase\u00F1a", value: values.repeat_password, onChange: handleChange, className: "h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30" }), errors.repeat_password && (_jsx("p", { className: "text-sm text-destructive mt-1.5", children: errors.repeat_password }))] }), _jsx(Button, { type: "submit", className: "w-full h-10 sm:h-11 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]", disabled: isSubmitting, children: isSubmitting ? "Cargando..." : "Registrarse" })] }) }));
};
