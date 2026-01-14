import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
const iconSuggestions = [
    "fa-brands fa-facebook",
    "fa-brands fa-instagram",
    "fa-brands fa-x-twitter",
    "fa-brands fa-linkedin",
    "fa-brands fa-youtube",
    "fa-brands fa-tiktok",
    "fa-brands fa-telegram",
    "fa-brands fa-whatsapp",
    "fa-regular fa-envelope",
];
const emptyForm = {
    name: "",
    url: "",
    icon_class: "",
    color: "#000000",
    available_in_ca: true,
    available_in_es: true,
    available_in_en: true,
    available_in_fr: false,
    order: 0,
    is_active: true,
};
export function SocialLinkDialog({ open, onOpenChange, onSubmit, link, }) {
    const [formData, setFormData] = useState(emptyForm);
    useEffect(() => {
        if (link) {
            const { id, ...rest } = link;
            setFormData(rest);
        }
        else {
            setFormData(emptyForm);
        }
    }, [link, open]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === "number" ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    };
    const handleToggle = (name) => (checked) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-[640px] px-6", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: link ? "Editar enlace" : "Nuevo enlace" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Nombre" }), _jsx("div", { className: "w-full", children: _jsx(Input, { id: "name", name: "name", value: formData.name, onChange: handleChange, className: "w-full", required: true }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "order", children: "Orden" }), _jsx("div", { className: "w-full", children: _jsx(Input, { id: "order", name: "order", type: "number", value: formData.order, onChange: handleChange, className: "w-full", min: 0 }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "url", children: "URL" }), _jsx("div", { className: "w-full", children: _jsx(Input, { id: "url", name: "url", type: "url", value: formData.url, onChange: handleChange, className: "w-full", required: true }) })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "icon_class", children: "Icono (clase)" }), _jsx("div", { className: "w-full", children: _jsx(Input, { id: "icon_class", name: "icon_class", list: "icon-suggestions", placeholder: "fa-brands fa-facebook", value: formData.icon_class, onChange: handleChange, className: "w-full", required: true }) }), _jsx("datalist", { id: "icon-suggestions", children: iconSuggestions.map((item) => (_jsx("option", { value: item }, item))) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Escribe la clase de FontAwesome o elige una sugerencia." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "color", children: "Color" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { id: "color", name: "color", type: "color", value: formData.color, onChange: handleChange, className: "h-11 w-16 min-w-[64px]" }), _jsx(Input, { name: "color", value: formData.color, onChange: handleChange, className: "w-full", placeholder: "#000000" })] })] })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [_jsx(ToggleRow, { label: "Activo", checked: formData.is_active, onCheckedChange: handleToggle("is_active") }), _jsx(ToggleRow, { label: "Disponible CA", checked: formData.available_in_ca, onCheckedChange: handleToggle("available_in_ca") }), _jsx(ToggleRow, { label: "Disponible ES", checked: formData.available_in_es, onCheckedChange: handleToggle("available_in_es") }), _jsx(ToggleRow, { label: "Disponible EN", checked: formData.available_in_en, onCheckedChange: handleToggle("available_in_en") }), _jsx(ToggleRow, { label: "Disponible FR", checked: formData.available_in_fr, onCheckedChange: handleToggle("available_in_fr") })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "submit", children: link ? "Guardar cambios" : "Crear enlace" }) })] })] }) }));
}
function ToggleRow({ label, checked, onCheckedChange }) {
    return (_jsxs("label", { className: "flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm", children: [_jsx("span", { children: label }), _jsx(Switch, { checked: checked, onCheckedChange: onCheckedChange })] }));
}
