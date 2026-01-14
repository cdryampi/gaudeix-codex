import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { EventDialog } from "../components/EventDialog";
import { EventsFilters } from "../components/EventsFilters";
import { EventsTable } from "../components/EventsTable";
import { eventsApi } from "../api/events";
import { envConfig } from "@/lib/config/env";
export function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState();
    const [deleteEventId, setDeleteEventId] = useState(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(envConfig.events.pageSizeDefault);
    const filtered = useMemo(() => {
        return events.filter((event) => {
            const matchesStatus = status === "all"
                ? true
                : status === "published"
                    ? event.is_published
                    : !event.is_published;
            const tagsText = (event.tags || []).map((t) => `${t.nombre} ${t.slug}`).join(" ");
            const text = `${event.title} ${event.summary ?? ""} ${event.description ?? ""} ${event.venue_name ?? ""} ${event.location_text ?? ""} ${event.price_text ?? ""} ${event.category_name ?? ""} ${event.category_slug ?? ""} ${tagsText}`.toLowerCase();
            const matchesSearch = text.includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [events, search, status]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await eventsApi.getAll();
            setEvents(data);
        }
        catch (err) {
            console.error("Error fetching events:", err);
            setError("Error al cargar los eventos.");
            setEvents([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchEvents();
    }, []);
    const handleCreate = () => {
        setEditingEvent(undefined);
        setIsDialogOpen(true);
    };
    const handleEdit = (event) => {
        setEditingEvent(event);
        setIsDialogOpen(true);
    };
    const handleDelete = async (id) => {
        setDeleteEventId(id);
    };
    const handleDeleteConfirm = async () => {
        if (!deleteEventId)
            return;
        try {
            await eventsApi.delete(deleteEventId);
            await fetchEvents();
            toast.success("Evento eliminado correctamente");
        }
        catch (err) {
            console.error("Error deleting event:", err);
            toast.error("No se pudo eliminar el evento");
        }
        finally {
            setDeleteEventId(null);
        }
    };
    const handleSubmit = async (data) => {
        try {
            if (editingEvent) {
                await eventsApi.update(editingEvent.id, data);
                toast.success("Evento actualizado correctamente");
            }
            else {
                await eventsApi.create(data);
                toast.success("Evento creado correctamente");
            }
            setIsDialogOpen(false);
            await fetchEvents();
        }
        catch (err) {
            console.error("Error saving event:", err);
            toast.error("No se pudo guardar el evento");
        }
    };
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Eventos", description: "Gestiona los eventos publicados y borradores", actions: _jsxs(Button, { onClick: handleCreate, size: "sm", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nuevo evento"] }) }), _jsx(EventsFilters, { search: search, onSearch: (v) => {
                    setSearch(v);
                    setPage(1);
                }, status: status, onStatus: (v) => {
                    setStatus(v);
                    setPage(1);
                }, pageSize: pageSize, onPageSize: (v) => {
                    setPageSize(v);
                    setPage(1);
                } }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex h-48 items-center justify-center text-muted-foreground", children: "Cargando eventos..." })) : error ? (_jsx("div", { className: "flex h-48 items-center justify-center text-destructive", children: error })) : (_jsx(EventsTable, { events: paginated, onEdit: handleEdit, onDelete: handleDelete })) }) }), _jsxs("div", { className: "mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between", children: [_jsxs("span", { children: ["P\u00E1gina ", page, " de ", totalPages, " \u2022 ", filtered.length, " resultados"] }), _jsx("div", { className: "w-full md:w-auto", children: _jsx(Pagination, { page: page, totalPages: totalPages, onPageChange: setPage }) })] }), _jsx(EventDialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, onSubmit: handleSubmit, event: editingEvent }), _jsx(AlertDialog, { open: deleteEventId !== null, onOpenChange: () => setDeleteEventId(null), children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "\u00BFEst\u00E1s seguro?" }), _jsx(AlertDialogDescription, { children: "Esta acci\u00F3n no se puede deshacer. El evento ser\u00E1 eliminado permanentemente." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: handleDeleteConfirm, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Eliminar" })] })] }) })] }));
}
