import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi } from "../api/categories";
import { CategoriesTable } from "../components/CategoriesTable";
import { CategoryDialog } from "../components/CategoryDialog";
export function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState();
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return categories.filter((c) => {
            const parentText = c.parent ? `parent:${c.parent}` : "";
            return `${c.slug} ${c.nombre} ${c.descripcion} ${c.icon || ""} ${c.taxonomy || ""} ${parentText}`
                .toLowerCase()
                .includes(q);
        });
    }, [categories, search]);
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoriesApi.list();
            setCategories(data);
        }
        catch (err) {
            console.error(err);
            setError("No se pudieron cargar las categorías");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);
    const handleSubmit = async (payload) => {
        try {
            if (editing) {
                await categoriesApi.update(editing.id, payload);
                toast.success("Categoría actualizada");
            }
            else {
                await categoriesApi.create(payload);
                toast.success("Categoría creada");
            }
            setDialogOpen(false);
            setEditing(undefined);
            fetchCategories();
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo guardar la categoría");
        }
    };
    const handleDelete = async (id) => {
        try {
            await categoriesApi.remove(id);
            toast.success("Categoría eliminada");
            fetchCategories();
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar la categoría");
        }
    };
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Categor\u00EDas", description: "Gestiona categor\u00EDas y sus traducciones", actions: _jsxs(Button, { size: "sm", onClick: () => setDialogOpen(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nueva categor\u00EDa"] }) }), _jsx("div", { className: "mb-4 flex items-center gap-3", children: _jsx(Input, { placeholder: "Buscar por slug o nombre", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-sm" }) }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex h-40 items-center justify-center text-muted-foreground", children: "Cargando..." })) : error ? (_jsx("div", { className: "flex h-40 items-center justify-center text-destructive", children: error })) : (_jsx(CategoriesTable, { categories: filtered, onEdit: (c) => { setEditing(c); setDialogOpen(true); }, onDelete: handleDelete })) }) }), _jsx(CategoryDialog, { open: dialogOpen, onOpenChange: (v) => {
                    setDialogOpen(v);
                    if (!v)
                        setEditing(undefined);
                }, onSubmit: handleSubmit, category: editing, categories: categories })] }));
}
