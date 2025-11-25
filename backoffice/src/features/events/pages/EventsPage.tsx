import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(envConfig.EVENTS_PAGE_SIZE_DEFAULT);

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.is_published).length;
    const upcoming = events.filter((e) => new Date(e.start_at) > new Date()).length;
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
      const text = `${event.title} ${event.description ?? ""} ${event.location_text ?? ""}`.toLowerCase();
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
    if (confirm("¿Eliminar este evento?")) {
      try {
        await eventsApi.delete(id);
        await fetchEvents();
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("No se pudo eliminar el evento.");
      }
    }
  };

  const handleSubmit = async (data: CreateEventDTO) => {
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, data);
      } else {
        await eventsApi.create(data);
      }
      setIsDialogOpen(false);
      await fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      alert("No se pudo guardar el evento.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Eventos"
        description="Gestiona los eventos publicados y borradores"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatPill icon={CalendarDays} label="Totales" value={stats.total} tone="neutral" />
        <StatPill icon={CheckCircle2} label="Publicados" value={stats.published} tone="primary" />
        <StatPill icon={CalendarDays} label="Próximos" value={stats.upcoming} tone="neutral" />
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

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando eventos...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-red-500">
              {error}
            </div>
          ) : (
            <EventsTable events={paginated} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {page} de {totalPages} • {filtered.length} resultados
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        event={editingEvent}
      />
    </PageContainer>
  );
}

type StatPillProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  tone?: "primary" | "neutral";
};

function StatPill({ icon: Icon, label, value, tone = "neutral" }: StatPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          tone === "primary" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
      <Badge variant="outline" className="ml-auto text-xs">
        En vivo
      </Badge>
    </div>
  );
}
