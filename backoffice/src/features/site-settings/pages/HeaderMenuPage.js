import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, Plus } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi } from "@/features/categories/api/categories";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { menuItemsApi } from "../api/menuItems";
function defaults() {
    return {
        location: "header",
        parent: null,
        order: 0,
        type: "category",
        category_id: null,
        static_page_id: null,
        url: "",
        label: "",
    };
}
function getDisplayLabel(item) {
    if (item.type === "category") {
        return item.category?.nombre || (item.category_id ? `Categoría #${item.category_id}` : "Categoría");
    }
    if (item.type === "static_page") {
        return item.static_page?.titulo || (item.static_page_id ? `Página #${item.static_page_id}` : "Página");
    }
    return item.label || item.url || "Link";
}
function buildOrderedWithDepth(items) {
    const byParent = new Map();
    for (const item of items) {
        const key = item.parent ?? null;
        const bucket = byParent.get(key) ?? [];
        bucket.push(item);
        byParent.set(key, bucket);
    }
    for (const siblings of byParent.values()) {
        siblings.sort((a, b) => (a.order - b.order) || (a.id - b.id));
    }
    const result = [];
    const seen = new Set();
    const walk = (parentId, depth, stack) => {
        const children = byParent.get(parentId) ?? [];
        for (const child of children) {
            if (stack.has(child.id))
                continue; // safety against inconsistent data
            if (!seen.has(child.id)) {
                result.push({ item: child, depth });
                seen.add(child.id);
            }
            const nextStack = new Set(stack);
            nextStack.add(child.id);
            walk(child.id, depth + 1, nextStack);
        }
    };
    walk(null, 0, new Set());
    // Orphans fallback (should not happen normally)
    const orphans = items
        .filter((i) => !seen.has(i.id))
        .sort((a, b) => (a.order - b.order) || (a.id - b.id));
    for (const orphan of orphans) {
        result.push({ item: orphan, depth: 0 });
    }
    return result;
}
export function HeaderMenuPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pages, setPages] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState(defaults());
    const [saving, setSaving] = useState(false);
    const fetchAll = async () => {
        try {
            setLoading(true);
            setError(null);
            const [menuItems, cats, staticPages] = await Promise.all([
                menuItemsApi.list({ location: "header" }),
                categoriesApi.list(),
                staticPagesApi.list(),
            ]);
            setItems(menuItems);
            setCategories(cats);
            setPages(staticPages);
        }
        catch (err) {
            console.error(err);
            setError("No se pudieron cargar los ítems del header");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAll();
    }, []);
    const ordered = useMemo(() => buildOrderedWithDepth(items), [items]);
    const labelById = useMemo(() => {
        const map = new Map();
        for (const entry of ordered) {
            map.set(entry.item.id, getDisplayLabel(entry.item));
        }
        return map;
    }, [ordered]);
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return ordered.filter(({ item }) => {
            const label = getDisplayLabel(item);
            return `${label} ${item.url || ""} ${item.type} ${item.order}`.toLowerCase().includes(q);
        });
    }, [ordered, search]);
    const parentsOptions = useMemo(() => {
        const candidates = ordered.filter(({ item }) => item.id !== form.id);
        return candidates.map(({ item, depth }) => ({
            id: item.id,
            depth,
            label: getDisplayLabel(item),
        }));
    }, [form.id, ordered]);
    const openCreate = () => {
        setForm(defaults());
        setDialogOpen(true);
    };
    const openEdit = (item) => {
        setForm({
            id: item.id,
            location: "header",
            parent: item.parent ?? null,
            order: item.order ?? 0,
            type: item.type,
            category_id: item.category?.id ?? item.category_id ?? null,
            static_page_id: item.static_page?.id ?? item.static_page_id ?? null,
            url: item.url || "",
            label: item.label || "",
        });
        setDialogOpen(true);
    };
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async () => {
        setSaving(true);
        try {
            const payload = {
                location: "header",
                parent: form.parent,
                order: Number(form.order) || 0,
                type: form.type,
                label: form.label,
                url: form.url,
                category_id: form.type === "category" ? form.category_id : null,
                static_page_id: form.type === "static_page" ? form.static_page_id : null,
            };
            if (form.id) {
                await menuItemsApi.update(form.id, payload);
                toast.success("Ítem actualizado");
            }
            else {
                await menuItemsApi.create(payload);
                toast.success("Ítem creado");
            }
            setDialogOpen(false);
            fetchAll();
        }
        catch (err) {
            console.error(err);
            const detail = err?.response?.data?.type?.[0] || err?.response?.data?.url?.[0] || err?.response?.data?.label?.[0];
            toast.error("No se pudo guardar el ítem", { description: detail });
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await menuItemsApi.remove(id);
            toast.success("Ítem eliminado");
            fetchAll();
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar el ítem");
        }
    };
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Header", description: "Configura el men\u00FA principal del header (categor\u00EDas, p\u00E1ginas est\u00E1ticas o links).", actions: _jsxs(Button, { size: "sm", onClick: openCreate, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nuevo \u00EDtem"] }) }), _jsxs(Alert, { variant: "destructive", className: "mb-4 w-3/4", children: [_jsx(TriangleAlert, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Men\u00FA sensible" }), _jsx(AlertDescription, { className: "text-sm", children: "M\u00E1ximo 3 niveles (ra\u00EDz \u2192 hijo \u2192 nieto). Evita ciclos y revisa en web tras guardar." })] }), _jsx("div", { className: "mb-4 flex items-center gap-3", children: _jsx(Input, { placeholder: "Buscar por etiqueta o tipo", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-sm" }) }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: "Cargando..." })) : error ? (_jsx("div", { className: "flex h-40 items-center justify-center text-destructive", children: error })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Etiqueta" }), _jsx(TableHead, { children: "Tipo" }), _jsx(TableHead, { children: "Padre" }), _jsx(TableHead, { children: "Orden" }), _jsx(TableHead, { className: "text-right", children: "Acciones" })] }) }), _jsx(TableBody, { children: filtered.map(({ item, depth }) => {
                                    const displayLabel = getDisplayLabel(item);
                                    const parentLabel = item.parent == null ? "—" : labelById.get(item.parent) || `#${item.parent}`;
                                    return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center gap-2", style: { paddingLeft: depth * 12 }, children: [depth > 0 ? _jsx("span", { className: "text-muted-foreground", children: "\u21B3" }) : null, _jsx("span", { children: displayLabel })] }) }), _jsx(TableCell, { children: item.type }), _jsx(TableCell, { children: parentLabel }), _jsx(TableCell, { children: item.order }), _jsx(TableCell, { className: "text-right", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => openEdit(item), children: "Editar" }), _jsx(Button, { size: "sm", variant: "destructive", onClick: () => handleDelete(item.id), children: "Eliminar" })] }) })] }, item.id));
                                }) })] })) }) }), _jsx(Dialog, { open: dialogOpen, onOpenChange: (v) => setDialogOpen(v), children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: form.id ? "Editar ítem" : "Nuevo ítem" }) }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Tipo" }), _jsxs("select", { value: form.type, onChange: (e) => handleChange("type", e.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "category", children: "Categor\u00EDa" }), _jsx("option", { value: "static_page", children: "P\u00E1gina est\u00E1tica" }), _jsx("option", { value: "custom", children: "Link personalizado" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Padre (opcional)" }), _jsxs("select", { value: form.parent ?? "", onChange: (e) => handleChange("parent", e.target.value ? Number(e.target.value) : null), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Sin padre (nivel ra\u00EDz)" }), parentsOptions.map((p) => (_jsx("option", { value: p.id, children: `${"\u00A0".repeat(p.depth * 3)}${p.label}` }, p.id)))] })] }), form.type === "category" && (_jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Categor\u00EDa" }), _jsxs("select", { value: form.category_id ?? "", onChange: (e) => handleChange("category_id", e.target.value ? Number(e.target.value) : null), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Selecciona categor\u00EDa" }), categories.map((c) => (_jsxs("option", { value: c.id, children: [c.nombre, " (", c.slug, ")"] }, c.id)))] })] })), form.type === "static_page" && (_jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "P\u00E1gina est\u00E1tica" }), _jsxs("select", { value: form.static_page_id ?? "", onChange: (e) => handleChange("static_page_id", e.target.value ? Number(e.target.value) : null), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Selecciona p\u00E1gina" }), pages.map((p) => (_jsxs("option", { value: p.id, children: [p.titulo, " (", p.template, ")"] }, p.id)))] })] })), form.type === "custom" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Etiqueta" }), _jsx(Input, { value: form.label, onChange: (e) => handleChange("label", e.target.value) })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "URL" }), _jsx(Input, { value: form.url, onChange: (e) => handleChange("url", e.target.value), placeholder: "https://..." })] })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Orden" }), _jsx(Input, { type: "number", value: form.order, onChange: (e) => handleChange("order", Number(e.target.value)) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Menor = m\u00E1s arriba dentro del mismo nivel." })] })] }), _jsxs(DialogFooter, { className: "mt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setDialogOpen(false), disabled: saving, children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, disabled: saving, children: saving ? "Guardando..." : "Guardar" })] })] }) })] }));
}
