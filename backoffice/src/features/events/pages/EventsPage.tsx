import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader, StatCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { EventDialog } from "../components/EventDialog";
import { EventsFilters } from "../components/EventsFilters";
import { EventsTable } from "../components/EventsTable";
import { CreateEventDTO, Event } from "../types";
import { eventsApi } from "../api/events";
import { envConfig } from "@/lib/config/env";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(envConfig.EVENTS_PAGE_SIZE_DEFAULT);

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.is_published).length;
    const upcoming = events.filter(
      (e) => new Date(e.start_at) > new Date()
    ).length;
    return { total, published, upcoming };
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
          ? event.is_published
          : !event.is_published;
      const text = `${event.title} ${event.description ?? ""} ${
        event.location_text ?? ""
      }`.toLowerCase();
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
      const data = await eventsApi.getAll();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Error al cargar los eventos.");
    } finally {
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

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteEventId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEventId) return;

    try {
      await eventsApi.delete(deleteEventId);
      await fetchEvents();
      toast.success("Evento eliminado correctamente");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("No se pudo eliminar el evento");
    } finally {
      setDeleteEventId(null);
    }
  };

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, data);
        toast.success("Evento actualizado correctamente");
      } else {
        await eventsApi.create(data);
        toast.success("Evento creado correctamente");
      }
      setIsDialogOpen(false);
      await fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      toast.error("No se pudo guardar el evento");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Eventos"
        description="Gestiona los eventos publicados y borradores"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo evento
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total eventos
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Publicados
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.published}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Próximos
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.upcoming}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EventsFilters
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        status={status}
        onStatus={(v) => {
          setStatus(v);
          setPage(1);
        }}
        pageSize={pageSize}
        onPageSize={(v) => {
          setPageSize(v);
          setPage(1);
        }}
      />

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando eventos...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <EventsTable
              events={paginated}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {page} de {totalPages} • {filtered.length} resultados
        </span>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        event={editingEvent}
      />

      <AlertDialog
        open={deleteEventId !== null}
        onOpenChange={() => setDeleteEventId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
