/**
 * Activities management page.
 */
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Upload, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ActivityDialog } from "../components/ActivityDialog";
import { ProgrammingDashboard } from "../components/ProgrammingDashboard";
import { activitiesApi } from "../api/activities";
import { programsApi } from "../api/programs";
import { venuesApi } from "../api/venues";
import { Activity, CreateActivityDTO, Program, Venue } from "../types";

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<"publish" | "unpublish" | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const programsById = useMemo(() => {
    return new Map(programs.map((program) => [program.id, program]));
  }, [programs]);

  const filtered = useMemo(() => {
    return activities.filter((activity) => {
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? activity.is_published
            : !activity.is_published;

      if (!matchesStatus) return false;
      if (programSlug && activity.program_slug !== programSlug) return false;

      const startDay = activity.start_at ? activity.start_at.slice(0, 10) : "";
      if (dateFrom && (!startDay || startDay < dateFrom)) return false;
      if (dateTo && (!startDay || startDay > dateTo)) return false;

      if (search) {
        const programTitle = programsById.get(activity.program)?.title || "";
        const venueName = activity.venue_name || "";
        const text = `${activity.title} ${activity.summary} ${activity.description} ${activity.slug} ${programTitle} ${venueName}`.toLowerCase();
        return text.includes(search.toLowerCase());
      }

      return true;
    });
  }, [activities, status, programSlug, dateFrom, dateTo, search, programsById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const allPaginatedSelected =
    paginated.length > 0 && paginated.every((activity) => selectedIds.includes(activity.id));

  useEffect(() => {
    const filteredIds = new Set(filtered.map((activity) => activity.id));
    setSelectedIds((prev) => prev.filter((id) => filteredIds.has(id)));
  }, [filtered]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [activitiesData, programsData, venuesData] = await Promise.all([
        activitiesApi.getAll(),
        programsApi.getAll(),
        venuesApi.getAll(),
      ]);
      setActivities(activitiesData.results || activitiesData);
      setPrograms(programsData.results);
      setVenues(venuesData.results);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Error al cargar las actividades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingActivity(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await activitiesApi.delete(deleteSlug);
      await fetchData();
      toast.success("Actividad eliminada correctamente");
    } catch (err) {
      console.error("Error deleting activity:", err);
      toast.error("No se pudo eliminar la actividad");
    } finally {
      setDeleteSlug(null);
    }
  };

  const handleSubmit = async (data: CreateActivityDTO) => {
    try {
      if (editingActivity) {
        await activitiesApi.update(editingActivity.slug, data);
        toast.success("Actividad actualizada correctamente");
      } else {
        await activitiesApi.create(data);
        toast.success("Actividad creada correctamente");
      }
      setIsDialogOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving activity:", err);
      toast.error("No se pudo guardar la actividad");
    }
  };

  const handleToggleSelectAllPaginated = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((activity) => next.add(activity.id));
        return Array.from(next);
      });
      return;
    }

    const paginatedIds = new Set(paginated.map((activity) => activity.id));
    setSelectedIds((prev) => prev.filter((id) => !paginatedIds.has(id)));
  };

  const handleToggleSelectRow = (activityId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(activityId)) return prev;
        return [...prev, activityId];
      }
      return prev.filter((id) => id !== activityId);
    });
  };

  const handleBulkConfirm = async () => {
    if (!bulkAction || selectedIds.length === 0) {
      setBulkAction(null);
      return;
    }

    const selectedActivities = activities.filter((activity) => selectedIds.includes(activity.id));
    if (selectedActivities.length === 0) {
      setBulkAction(null);
      return;
    }

    const nextStatus = bulkAction === "publish" ? "published" : "draft";

    try {
      await Promise.all(
        selectedActivities.map((activity) =>
          activitiesApi.update(activity.slug, {
            status: nextStatus,
          }),
        ),
      );

      toast.success(
        bulkAction === "publish"
          ? `${selectedActivities.length} actividades publicadas`
          : `${selectedActivities.length} actividades despublicadas`,
      );

      setSelectedIds([]);
      await fetchData();
    } catch (err) {
      console.error("Error applying bulk action on activities:", err);
      toast.error("No se pudieron actualizar todas las actividades seleccionadas");
    } finally {
      setBulkAction(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Actividades"
        description="Gestiona las actividades de cada programa"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva actividad
          </Button>
        }
      />

      <div className="mb-6">
        <ProgrammingDashboard
          activities={activities}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(value) => {
            setDateFrom(value);
            setPage(1);
          }}
          onDateToChange={(value) => {
            setDateTo(value);
            setPage(1);
          }}
          onClearFilters={() => {
            setStatus("all");
            setDateFrom("");
            setDateTo("");
            setPage(1);
          }}
        />
      </div>

      <div className="mb-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Título, slug o programa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "all" | "published" | "draft");
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Programa</Label>
            <select
              value={programSlug}
              onChange={(e) => {
                setProgramSlug(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todos</option>
              {programs.map((program) => (
                <option key={program.slug} value={program.slug}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => setBulkAction("publish")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Publicar seleccionadas ({selectedIds.length})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => setBulkAction("unpublish")}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Despublicar seleccionadas ({selectedIds.length})
            </Button>
          </div>

          <Label className="text-xs text-muted-foreground">Ver:</Label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-8 rounded border border-border bg-card px-2 text-xs"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando actividades...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-auto caption-bottom text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
                    <th className="w-10 px-3">
                      <Checkbox
                        checked={allPaginatedSelected}
                        onChange={(event) => handleToggleSelectAllPaginated(event.target.checked)}
                        aria-label="Seleccionar actividades de la pagina"
                      />
                    </th>
                    <th>Título</th>
                    <th>Programa</th>
                    <th>Lugar</th>
                    <th>Fecha/Hora</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-6 text-center text-muted-foreground"
                      >
                        No hay actividades creadas.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((activity) => (
                      <tr key={activity.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-3 py-4">
                          <Checkbox
                            checked={selectedIds.includes(activity.id)}
                            onChange={(event) =>
                              handleToggleSelectRow(activity.id, event.target.checked)
                            }
                            aria-label={`Seleccionar ${activity.title}`}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.slug}</p>
                          {activity.category && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {activity.category}
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {programsById.get(activity.program)?.title || activity.program_slug}
                        </td>
                        <td className="px-5 py-4">
                          {activity.venue_name || "-"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap">
                            {activity.start_at ? new Date(activity.start_at).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {activity.is_free ? (
                            <Badge variant="secondary">Gratis</Badge>
                          ) : activity.price_text ? (
                            <span>{activity.price_text}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {activity.is_published ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                              Publicada
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">
                              Borrador
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(activity)}
                              aria-label={`Editar ${activity.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteSlug(activity.slug)}
                              aria-label={`Eliminar ${activity.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Página {page} de {totalPages} • {filtered.length} resultados
        </span>
        <div className="w-full md:w-auto">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <ActivityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        activity={editingActivity}
        programs={programs}
        venues={venues}
      />

      <AlertDialog open={deleteSlug !== null} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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

      <AlertDialog open={bulkAction !== null} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "publish"
                ? "¿Publicar actividades seleccionadas?"
                : "¿Despublicar actividades seleccionadas?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se actualizaran {selectedIds.length} actividades. Esta accion requiere confirmacion
              explicita para evitar cambios accidentales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkConfirm}>
              {bulkAction === "publish" ? "Confirmar publicacion" : "Confirmar despublicacion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
