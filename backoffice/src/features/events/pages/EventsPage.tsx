import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { EventDialog } from "../components/EventDialog";
import { EventsFilters, DateRangePreset } from "../components/EventsFilters";
import { EventsTable } from "../components/EventsTable";
import { CreateEventDTO, Event } from "../types";
import { eventsApi } from "../api/events";
import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";
import { envConfig } from "@/lib/config/env";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventPreview } from "../components/EventPreview";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog/Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [category, setCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState<boolean | null>(null);
  const [isFree, setIsFree] = useState<boolean | null>(null);
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(envConfig.events.pageSizeDefault);

  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    return events.filter((event) => {
      // 1. Status Filter
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? event.is_published
            : !event.is_published;
      if (!matchesStatus) return false;

      // 2. Category Filter
      if (category && event.category_slug !== category) return false;

      // 3. Featured Filter
      if (isFeatured !== null && event.is_featured !== isFeatured) return false;

      // 4. Free Filter
      if (isFree !== null && event.is_free !== isFree) return false;

      // 5. Date Filter (Check if ANY session matches the preset)
      if (datePreset !== "all") {
        const eventDates = event.dates || [];
        const datesToCheck =
          eventDates.length > 0
            ? eventDates.map((d) => new Date(d.start_at))
            : [new Date(event.start_at)];

        const hasMatchingDate = datesToCheck.some((date) => {
          if (datePreset === "today") {
            return date.toISOString().split("T")[0] === todayStr;
          }
          if (datePreset === "weekend") {
            // Simplification: Check if day is Fri (5), Sat (6) or Sun (0)
            const day = date.getDay();
            const diffFromToday =
              (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            return (
              [0, 5, 6].includes(day) &&
              diffFromToday >= -1 &&
              diffFromToday < 7
            );
          }
          if (datePreset === "month") {
            return (
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear()
            );
          }
          return true;
        });
        if (!hasMatchingDate) return false;
      }

      // 6. Search Filter (Text)
      if (search) {
        const tagsText = (event.tags || [])
          .map((t) => `${t.nombre} ${t.slug}`)
          .join(" ");
        const text =
          `${event.title} ${event.summary ?? ""} ${event.description ?? ""} ${event.venue_name ?? ""} ${event.location_text ?? ""} ${event.category_name ?? ""} ${tagsText}`.toLowerCase();
        return text.includes(search.toLowerCase());
      }

      return true;
    });
  }, [events, search, status, category, isFeatured, isFree, datePreset]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventsData, categoriesData] = await Promise.all([
        eventsApi.getAll({ exclude_children: true }),
        categoriesApi.list({ taxonomy: "events" }),
      ]);
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching events data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      await fetchData();
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
      await fetchData();
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
        categories={categories}
        selectedCategory={category}
        onCategory={(v) => {
          setCategory(v);
          setPage(1);
        }}
        isFeatured={isFeatured}
        onIsFeatured={(v) => {
          setIsFeatured(v);
          setPage(1);
        }}
        isFree={isFree}
        onIsFree={(v) => {
          setIsFree(v);
          setPage(1);
        }}
        datePreset={datePreset}
        onDatePreset={(v) => {
          setDatePreset(v);
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
              onPreview={setPreviewEvent}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Página {page} de {totalPages} • {filtered.length} resultados
        </span>
        <div className="w-full md:w-auto">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
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

      <Dialog
        open={previewEvent !== null}
        onOpenChange={(open) => !open && setPreviewEvent(null)}
      >
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-none bg-transparent shadow-none">
          {previewEvent && <EventPreview event={previewEvent} />}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
