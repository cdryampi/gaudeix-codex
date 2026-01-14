import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AuthCard } from "../components/AuthCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";
import { LogIn, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
const loginSchema = z.object({
    username: z.string().min(1, "El usuario o email es obligatorio"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});
export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        remember: true,
    });
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState("");
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        if (loginError)
            setLoginError("");
    };
    const handleRememberChange = (checked) => {
        setFormData((prev) => ({ ...prev, remember: checked }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setErrors({});
        setLoginError("");
        try {
            const validatedData = loginSchema.parse(formData);
            // login method now takes object: { username, password }
            await login({
                username: validatedData.username,
                password: validatedData.password,
            });
            navigate(ROUTES.DASHBOARD);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = {};
                error.issues.forEach((err) => {
                    if (err.path[0]) {
                        formattedErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(formattedErrors);
            }
            else {
                const message = error instanceof Error ? error.message : null;
                setLoginError(message ?? "Error al iniciar sesión. Verifica tus credenciales.");
            }
        }
    };
    useEffect(() => {
        if (isAuthenticated) {
            navigate(ROUTES.DASHBOARD, { replace: true });
        }
    }, [isAuthenticated, navigate]);
    return (_jsx(AuthCard, { title: "Bienvenido", subtitle: "Accede a tu cuenta", children: _jsxs("div", { className: "mx-auto w-full max-w-[520px] space-y-5 sm:space-y-6", children: [_jsxs("div", { className: "space-y-2 text-center", children: [_jsx(Badge, { variant: "outline", className: "border-primary/30 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15", children: "Acceso seguro" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Usa tus credenciales para entrar al panel" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 sm:space-y-5 text-left px-10", autoComplete: "on", children: [loginError && (_jsxs(Alert, { variant: "destructive", className: "!border-red-500/40", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: loginError })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "Usuario o Email" }), _jsx(Input, { id: "username", name: "username", type: "text", placeholder: "usuario o email@ejemplo.com", value: formData.username, onChange: handleChange, disabled: isLoading, autoComplete: "username", className: "h-11 bg-background/80 !border border-border focus-visible:ring-2 focus-visible:ring-primary/50 w-full max-w-full" }), errors.username && (_jsx("p", { className: "text-sm text-destructive", children: errors.username }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Contrase\u00F1a" }), _jsx(Input, { id: "password", name: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: formData.password, onChange: handleChange, disabled: isLoading, autoComplete: "current-password", className: "h-11 bg-background/80 !border border-border focus-visible:ring-2 focus-visible:ring-primary/50 w-full max-w-full" }), errors.password && (_jsx("p", { className: "text-sm text-destructive", children: errors.password }))] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx(Switch, { id: "remember", checked: formData.remember, onCheckedChange: handleRememberChange }), _jsx("span", { children: "Mantener sesi\u00F3n abierta" })] }), _jsx(Link, { to: "/reset-password", className: "font-medium text-primary hover:underline", children: "Recuperar acceso" })] }), _jsx(Button, { type: "submit", className: "w-full h-11 text-base font-medium !bg-primary text-primary-foreground hover:!bg-primary/90", disabled: isLoading, children: isLoading ? ("Iniciando sesión...") : (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "mr-2 h-4 w-4" }), "Iniciar sesi\u00F3n"] })) })] })] }) }));
};
