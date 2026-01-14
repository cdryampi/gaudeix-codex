import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Send } from "lucide-react";
export function TestFormPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setSubmitted(false);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simular envío de formulario
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Formulario enviado:", formData);
        setSubmitted(true);
        setIsLoading(false);
    };
    const handleReset = () => {
        setFormData({ name: "", email: "", message: "" });
        setSubmitted(false);
    };
    return (_jsx("div", { className: "min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6", children: _jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("h1", { className: "text-4xl font-bold tracking-tight", children: "P\u00E1gina de Prueba" }), _jsx("p", { className: "text-muted-foreground", children: "Formulario de prueba para verificar componentes de shadcn/ui" })] }), _jsx("div", { className: "flex justify-center", children: _jsxs(Badge, { variant: "outline", className: "bg-green-500/10 text-green-700 border-green-500/20", children: [_jsx(CheckCircle2, { className: "mr-1 h-3 w-3" }), "Sistema funcionando correctamente"] }) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Formulario de Contacto" }), _jsx(CardDescription, { children: "Completa el formulario para probar la funcionalidad" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Nombre" }), _jsx(Input, { id: "name", name: "name", placeholder: "Tu nombre", value: formData.name, onChange: handleChange, disabled: isLoading, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", name: "email", type: "email", placeholder: "tu@email.com", value: formData.email, onChange: handleChange, disabled: isLoading, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "message", children: "Mensaje" }), _jsx("textarea", { id: "message", name: "message", placeholder: "Tu mensaje...", value: formData.message, onChange: handleChange, disabled: isLoading, required: true, rows: 4, className: "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" })] }), submitted && (_jsxs(Alert, { className: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-green-600 dark:text-green-400" }), _jsx(AlertDescription, { className: "text-green-800 dark:text-green-200", children: "\u00A1Formulario enviado con \u00E9xito!" })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "submit", disabled: isLoading, className: "flex-1", children: isLoading ? ("Enviando...") : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), "Enviar"] })) }), _jsx(Button, { type: "button", variant: "outline", onClick: handleReset, children: "Limpiar" })] })] }) })] }), (formData.name || formData.email || formData.message) && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Vista Previa de Datos" }) }), _jsx(CardContent, { children: _jsx("pre", { className: "text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-auto", children: JSON.stringify(formData, null, 2) }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Componentes de Prueba" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-2", children: "Badges:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { children: "Default" }), _jsx(Badge, { variant: "secondary", children: "Secondary" }), _jsx(Badge, { variant: "outline", children: "Outline" }), _jsx(Badge, { variant: "destructive", children: "Destructive" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-2", children: "Buttons:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", children: "Small" }), _jsx(Button, { children: "Default" }), _jsx(Button, { size: "lg", children: "Large" }), _jsx(Button, { variant: "outline", children: "Outline" }), _jsx(Button, { variant: "ghost", children: "Ghost" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-2", children: "Alerts:" }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Alert, { children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Alerta informativa" })] }), _jsxs(Alert, { variant: "destructive", children: [_jsx(XCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Alerta de error" })] })] })] })] })] })] }) }));
}
