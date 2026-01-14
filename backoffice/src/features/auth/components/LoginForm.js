import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
const formSchema = z.object({
    username: z.string().min(1, "El usuario es requerido"),
    password: z.string().min(1, "La contraseña es requerida"),
});
export function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    async function onSubmit(values) {
        setIsLoading(true);
        setError(null);
        try {
            await login(values);
            navigate("/dashboard");
        }
        catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
            }
            else {
                setError("Error al conectar con el servidor. Inténtalo de nuevo.");
            }
        }
        finally {
            setIsLoading(false);
        }
    }
    return (_jsxs("div", { className: "w-full max-w-sm space-y-6", children: [_jsxs("div", { className: "space-y-2 text-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Bienvenido" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "Ingresa tus credenciales para acceder al panel" })] }), error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "username", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Usuario" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "admin", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Contrase\u00F1a" }), _jsx(FormControl, { children: _jsx(Input, { type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs(Button, { type: "submit", className: "w-full", disabled: isLoading, children: [isLoading && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Iniciar Sesi\u00F3n"] })] }) })] }));
}
