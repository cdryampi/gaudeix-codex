import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
export function UserDialog({ open, onOpenChange, onSubmit, user, }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        name: "",
        password: "",
        password_confirm: "",
    });
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                name: user.name,
            });
        }
        else {
            setFormData({
                username: "",
                email: "",
                name: "",
                password: "",
                password_confirm: "",
            });
        }
    }, [user, open]);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "w-[92vw] max-w-[600px] sm:max-w-[540px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: user ? "Editar Usuario" : "Nuevo Usuario" }), _jsx(DialogDescription, { children: user
                                ? "Modifica los datos del usuario aquí."
                                : "Ingresa los datos del nuevo usuario." })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-4 items-center gap-3", children: [_jsx(Label, { htmlFor: "username", className: "text-right", children: "Usuario" }), _jsx(Input, { id: "username", value: formData.username, onChange: (e) => setFormData({ ...formData, username: e.target.value }), className: "col-span-3 w-auto min-w-[220px] max-w-full", required: true, disabled: !!user })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-3", children: [_jsx(Label, { htmlFor: "name", className: "text-right", children: "Nombre" }), _jsx(Input, { id: "name", value: formData.name || "", onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "col-span-3 w-auto min-w-[220px] max-w-full" })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-3", children: [_jsx(Label, { htmlFor: "email", className: "text-right", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "col-span-3 w-auto min-w-[220px] max-w-full", required: true })] }), !user && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-4 items-center gap-3", children: [_jsx(Label, { htmlFor: "password", className: "text-right", children: "Contrase\u00F1a" }), _jsx(Input, { id: "password", type: "password", value: formData.password || "", onChange: (e) => setFormData({ ...formData, password: e.target.value }), className: "col-span-3 w-auto min-w-[220px] max-w-full", required: true })] }), _jsxs("div", { className: "grid grid-cols-4 items-center gap-3", children: [_jsx(Label, { htmlFor: "password_confirm", className: "text-right", children: "Confirmar" }), _jsx(Input, { id: "password_confirm", type: "password", value: formData.password_confirm || "", onChange: (e) => setFormData({
                                                        ...formData,
                                                        password_confirm: e.target.value,
                                                    }), className: "col-span-3 w-auto min-w-[220px] max-w-full", required: true })] })] }))] }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", children: user ? "Guardar cambios" : "Crear usuario" }) })] })] }) }));
}
