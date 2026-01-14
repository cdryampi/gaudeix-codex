import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { placesApi } from "../api/places";
import { PlacesFilters } from "../components/PlacesFilters";
import { PlacesTable } from "../components/PlacesTable";
import { PlaceDialog } from "../components/PlaceDialog";
import { envConfig } from "@/lib/config/env";
export function PlacesPage() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(envConfig.events.pageSizeDefault);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState();
    const filtered = useMemo(() => {
        return places.filter((place) => {
            const matchesStatus = status === "all"
                ? true
                : status === "published"
                    ? place.is_published
                    : !place.is_published;
            const text = `${place.title} ${place.description ?? ""} ${place.location_text ?? ""}`.toLowerCase();
            const matchesSearch = text.includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [places, search, status]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);
    const fetchPlaces = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await placesApi.getAll();
            setPlaces(data);
        }
        catch (err) {
            console.error(err);
            setError("No se pudieron cargar los lugares.");
            setPlaces([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPlaces();
    }, []);
    const handleCreate = () => {
        setEditing(undefined);
        setDialogOpen(true);
    };
    const handleEdit = (place) => {
        setEditing(place);
        setDialogOpen(true);
    };
    const handleDelete = async (id) => {
        try {
            await placesApi.delete(id);
            toast.success("Lugar eliminado");
            fetchPlaces();
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar el lugar");
        }
    };
    const handleSubmit = async (payload) => {
        try {
            if (editing) {
                await placesApi.update(editing.id, payload);
                toast.success("Lugar actualizado");
            }
            else {
                await placesApi.create(payload);
                toast.success("Lugar creado");
            }
            setDialogOpen(false);
            setEditing(undefined);
            fetchPlaces();
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo guardar el lugar");
        }
    };
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Places", description: "Gestiona los lugares y sus traducciones", actions: _jsxs(Button, { size: "sm", onClick: handleCreate, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nuevo lugar"] }) }), _jsx(PlacesFilters, { search: search, onSearch: (v) => {
                    setSearch(v);
                    setPage(1);
                }, status: status, onStatus: (v) => {
                    setStatus(v);
                    setPage(1);
                }, pageSize: pageSize, onPageSize: (v) => {
                    setPageSize(v);
                    setPage(1);
                } }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex h-48 items-center justify-center text-muted-foreground", children: "Cargando lugares..." })) : error ? (_jsx("div", { className: "flex h-48 items-center justify-center text-destructive", children: error })) : (_jsx(PlacesTable, { places: paginated, onEdit: handleEdit, onDelete: handleDelete })) }) }), _jsxs("div", { className: "mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between", children: [_jsxs("span", { children: ["P\u00E1gina ", page, " de ", totalPages, " \u2022 ", filtered.length, " resultados"] }), _jsx("div", { className: "w-full md:w-auto", children: _jsx(Pagination, { page: page, totalPages: totalPages, onPageChange: setPage }) })] }), _jsx(PlaceDialog, { open: dialogOpen, onOpenChange: (v) => {
                    setDialogOpen(v);
                    if (!v)
                        setEditing(undefined);
                }, onSubmit: handleSubmit, place: editing })] }));
}
