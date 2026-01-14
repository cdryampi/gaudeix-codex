import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { staticPagesApi } from "../api/staticPages";
import { StaticPagesTable } from "../components/StaticPagesTable";
import { StaticPageDialog } from "../components/StaticPageDialog";
import { TEMPLATE_OPTIONS } from "../constants/templates";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
export function StaticPagesPage() {
    const [pages, setPages] = useState([]);
    const [search, setSearch] = useState("");
    const [templateFilter, setTemplateFilter] = useState("");
    const [publishedFilter, setPublishedFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState();
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return pages.filter((p) => {
            const matchesSearch = `${p.slug} ${p.titulo} ${p.cuerpo ?? ""} ${p.template}`.toLowerCase().includes(q);
            const matchesTemplate = templateFilter ? p.template === templateFilter : true;
            const matchesPublished = publishedFilter === ""
                ? true
                : publishedFilter === "true"
                    ? p.is_published
                    : publishedFilter === "false"
                        ? !p.is_published
                        : true;
            return matchesSearch && matchesTemplate && matchesPublished;
        });
    }, [pages, search, templateFilter, publishedFilter]);
    const fetchPages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await staticPagesApi.list();
            setPages(data);
        }
        catch (err) {
            console.error(err);
            setError("No se pudieron cargar las páginas estáticas");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPages();
    }, []);
    const handleSubmit = async (payload) => {
        try {
            if (editing) {
                await staticPagesApi.update(editing.id, payload);
                toast.success("Página actualizada");
            }
            else {
                await staticPagesApi.create(payload);
                toast.success("Página creada");
            }
            setDialogOpen(false);
            setEditing(undefined);
            fetchPages();
        }
        catch (err) {
            console.error(err);
            const detail = err?.response?.data?.template?.[0];
            toast.error("No se pudo guardar la página", { description: detail });
        }
    };
    const handleDelete = async (id) => {
        try {
            await staticPagesApi.remove(id);
            toast.success("Página eliminada");
            fetchPages();
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar la página");
        }
    };
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "P\u00E1ginas est\u00E1ticas", description: "Gestiona plantillas predefinidas (info point, privacidad, legal, cookies, contacto, inclusi\u00F3).", actions: _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: fetchPages, children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Recargar"] }), _jsxs(Button, { size: "sm", onClick: () => setDialogOpen(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nueva p\u00E1gina"] })] }) }), _jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-3", children: [_jsx(Input, { placeholder: "Buscar por slug, t\u00EDtulo o cuerpo", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-sm" }), _jsxs("select", { value: templateFilter, onChange: (e) => setTemplateFilter(e.target.value), className: "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Todas las plantillas" }), TEMPLATE_OPTIONS.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] }), _jsxs("select", { value: publishedFilter, onChange: (e) => setPublishedFilter(e.target.value), className: "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Publicaci\u00F3n (todas)" }), _jsx("option", { value: "true", children: "Publicadas" }), _jsx("option", { value: "false", children: "Borradores" })] }), _jsxs(Badge, { variant: "outline", className: "font-normal", children: ["Total: ", filtered.length] })] }), _jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(TriangleAlert, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Men\u00FAs y est\u00E1ticas son sensibles" }), _jsx(AlertDescription, { className: "text-sm", children: "Cada plantilla es \u00FAnica y se muestra en la web p\u00FAblica. Evita cambios innecesarios en slugs, plantillas o documentos legales. Para crear nuevas p\u00E1ginas usa solo las plantillas predefinidas y revisa enlaces en el header/footer." })] }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: "Cargando..." })) : error ? (_jsx("div", { className: "flex h-40 items-center justify-center text-destructive", children: error })) : (_jsx(StaticPagesTable, { pages: filtered, onEdit: (p) => { setEditing(p); setDialogOpen(true); }, onDelete: handleDelete })) }) }), _jsx(StaticPageDialog, { open: dialogOpen, onOpenChange: (v) => {
                    setDialogOpen(v);
                    if (!v)
                        setEditing(undefined);
                }, onSubmit: handleSubmit, page: editing })] }));
}
