import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "../constants/icons";
import { categoriesApi } from "../api/categories";
import { toast } from "sonner";
const emptyForm = {
    slug: "",
    taxonomy: "",
    icon: "",
    parent: null,
    nombre: "",
    descripcion: "",
    translations: {},
};
export function CategoryDialog({ open, onOpenChange, onSubmit, category, categories = [] }) {
    const [form, setForm] = useState(emptyForm);
    const [activeLang, setActiveLang] = useState("ca");
    const [translations, setTranslations] = useState({});
    const [loadingTranslate, setLoadingTranslate] = useState(false);
    const IconPreview = getCategoryIcon(form.icon);
    const parentOptions = categories.filter((c) => !category || c.id !== category.id);
    useEffect(() => {
        if (category) {
            setForm({
                slug: category.slug,
                taxonomy: category.taxonomy || "",
                icon: category.icon || "",
                parent: category.parent ?? null,
                nombre: category.nombre,
                descripcion: category.descripcion || "",
                translations: category.translations || {},
            });
            setTranslations(category.translations || {});
        }
        else {
            setForm(emptyForm);
            setTranslations({});
        }
    }, [category, open]);
    const updateField = (lang, field, value) => {
        if (lang === "ca") {
            setForm((prev) => ({ ...prev, [field]: value }));
        }
        else {
            setTranslations((prev) => ({
                ...prev,
                [lang]: {
                    ...prev[lang],
                    [field]: value,
                },
            }));
        }
    };
    const handleIconChange = (value) => {
        setForm((prev) => ({ ...prev, icon: value }));
    };
    const getContent = (lang) => {
        if (lang === "ca") {
            return { nombre: form.nombre, descripcion: form.descripcion };
        }
        return translations[lang] || { nombre: "", descripcion: "" };
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const translationsPayload = { ...translations };
        delete translationsPayload["ca"];
        const iconValue = form.icon?.trim() ?? "";
        const payload = {
            ...form,
            parent: form.parent ?? null,
            icon: iconValue,
            translations: Object.keys(translationsPayload).length ? translationsPayload : undefined,
        };
        await onSubmit(payload);
    };
    const handleAutoTranslate = async (targetLang) => {
        if (!category)
            return;
        if (!form.nombre) {
            toast.error("No hay nombre en el idioma base para traducir");
            return;
        }
        setLoadingTranslate(true);
        try {
            const response = await categoriesApi.autoTranslate(category.id, {
                source_lang: "ca",
                target_langs: [targetLang],
            });
            if (response.success && response.translations[targetLang]) {
                const t = response.translations[targetLang];
                setTranslations((prev) => ({ ...prev, [targetLang]: t }));
                toast.success(`Traducido a ${targetLang.toUpperCase()}`);
            }
            else {
                toast.error("Error al traducir", {
                    description: response.errors?.[targetLang] || "Error desconocido",
                });
            }
        }
        catch (err) {
            console.error(err);
            toast.error("Error al traducir categoría");
        }
        finally {
            setLoadingTranslate(false);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-[560px] px-6", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: category ? "Editar categoría" : "Nueva categoría" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "slug", children: "Slug" }), _jsx(Input, { id: "slug", name: "slug", value: form.slug, onChange: (e) => setForm((prev) => ({ ...prev, slug: e.target.value })), required: true, disabled: !!category })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "taxonomy", children: "Taxonom\u00EDa" }), _jsx(Input, { id: "taxonomy", name: "taxonomy", value: form.taxonomy || "", onChange: (e) => setForm((prev) => ({ ...prev, taxonomy: e.target.value })), placeholder: "template, theme, etc." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parent", children: "Categor\u00EDa padre (opcional)" }), _jsxs("select", { id: "parent", value: form.parent ?? "", onChange: (e) => setForm((prev) => ({ ...prev, parent: e.target.value ? Number(e.target.value) : null })), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Sin padre" }), parentOptions.map((opt) => (_jsxs("option", { value: opt.id, children: [opt.nombre, " (", opt.slug, ")"] }, opt.id)))] })] })] }), _jsxs("div", { className: "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "Icono" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Selecciona un icono (Lucide) para mostrarlo en los listados del backoffice." })] }), IconPreview && (_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-md border border-border/70 bg-background", children: _jsx(IconPreview, { className: "h-5 w-5 text-foreground" }) }))] }), _jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: CATEGORY_ICON_OPTIONS.map((option) => {
                                        const OptionIcon = option.icon;
                                        const isActive = form.icon === option.value;
                                        return (_jsxs("label", { className: cn("flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition", isActive ? "border-primary bg-primary/10 text-primary" : "border-border/70 hover:border-primary/40"), children: [_jsx("input", { type: "checkbox", className: "sr-only", checked: isActive, onChange: () => handleIconChange(isActive ? "" : option.value), "aria-label": `Icono ${option.labelEs}` }), _jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background", children: _jsx(OptionIcon, { className: "h-4 w-4" }) }), _jsxs("div", { className: "leading-tight", children: [_jsx("div", { className: "text-sm font-semibold", children: option.labelEs }), _jsx("div", { className: "text-xs text-muted-foreground", children: _jsx("span", { className: "font-bold", children: option.labelCa }) })] })] }, option.value));
                                    }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { id: "icon", name: "icon", value: form.icon || "", onChange: (e) => handleIconChange(e.target.value), list: "category-icon-suggestions", placeholder: "castle, flag, mountain..." }), form.icon && (_jsx("div", { className: "flex h-10 min-w-[2.5rem] items-center justify-center rounded-md border border-border/70 bg-background px-2", children: IconPreview ? (_jsx(IconPreview, { className: "h-5 w-5 text-foreground" })) : (_jsx("span", { className: "text-[11px] font-mono text-muted-foreground", children: "?" })) }))] }), _jsx("datalist", { id: "category-icon-suggestions", children: CATEGORY_ICON_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.labelEs }, option.value))) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Usa el nombre del icono en kebab-case (ej. castle, party-popper). Puedes escribirlo o elegir uno sugerido." })] }), _jsxs(Tabs, { value: activeLang, onValueChange: setActiveLang, defaultValue: "ca", children: [_jsx(TabsList, { className: "grid w-full grid-cols-4", children: LANGUAGES.map((lang) => (_jsx(TabsTrigger, { value: lang.code, children: lang.name }, lang.code))) }), LANGUAGES.map((lang) => {
                                    const content = getContent(lang.code);
                                    const isBase = lang.code === "ca";
                                    return (_jsxs(TabsContent, { value: lang.code, className: "space-y-3 pt-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: `nombre-${lang.code}`, children: ["Nombre ", isBase ? "" : `(${lang.name})`] }), !isBase && category && (_jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => handleAutoTranslate(lang.code), disabled: loadingTranslate || !form.nombre, children: loadingTranslate ? "Traduciendo..." : "Traducir IA" }))] }), _jsx(Input, { id: `nombre-${lang.code}`, value: content.nombre || "", onChange: (e) => updateField(lang.code, "nombre", e.target.value), required: isBase, placeholder: isBase ? "" : "Traducción automática o manual" }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: `descripcion-${lang.code}`, children: ["Descripci\u00F3n ", isBase ? "" : `(${lang.name})`] }), _jsx(Textarea, { id: `descripcion-${lang.code}`, value: content.descripcion || "", onChange: (e) => updateField(lang.code, "descripcion", e.target.value), placeholder: isBase ? "Descripción" : "Traducción automática o manual" })] })] }, lang.code));
                                })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancelar" }), _jsx(Button, { type: "submit", children: category ? "Guardar" : "Crear" })] })] })] }) }));
}
