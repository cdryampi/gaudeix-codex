/**
 * Venues management page.
 */
import { useCallback, useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { VenueDialog } from "../components/VenueDialog";
import { venuesApi } from "../api/venues";
import { CreateVenueDTO, Venue } from "../types";

export function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number | boolean> = {
        page,
        page_size: pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status === "published") {
        params.is_published = true;
      }

      if (status === "draft") {
        params.is_published = false;
      }

      const data = await venuesApi.getAll(params);
      setVenues(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Error al cargar los espacios.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setEditingVenue(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await venuesApi.delete(deleteSlug);
      await fetchData();
      toast.success("Espacio eliminado correctamente");
    } catch (err) {
      console.error("Error deleting venue:", err);
      toast.error("No se pudo eliminar el espacio");
    } finally {
      setDeleteSlug(null);
    }
  };

  const handleSubmit = async (data: CreateVenueDTO) => {
    try {
      if (editingVenue) {
        await venuesApi.update(editingVenue.slug, data);
        toast.success("Espacio actualizado correctamente");
      } else {
        await venuesApi.create(data);
        toast.success("Espacio creado correctamente");
      }
      setIsDialogOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving venue:", err);
      toast.error("No se pudo guardar el espacio");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Espacios"
        description="Gestiona recintos y ubicaciones para actividades"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo espacio
          </Button>
        }
      />

      <div className="mb-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Nombre, dirección o ciudad..."
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
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
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
              Cargando espacios...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] table-auto caption-bottom text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Coordenadas</th>
                    <th>Accesible</th>
                    <th>Estado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {venues.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-muted-foreground"
                      >
                        No hay espacios creados.
                      </td>
                    </tr>
                  ) : (
                    venues.map((venue) => (
                      <tr
                        key={venue.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">{venue.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {venue.slug}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>{venue.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {venue.city}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          {venue.latitude ?? "-"}, {venue.longitude ?? "-"}
                        </td>
                        <td className="px-5 py-4">
                          {venue.is_accessible ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                              Sí
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">
                              No
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {venue.is_published ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                              Publicado
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
                              onClick={() => handleEdit(venue)}
                              aria-label={`Editar ${venue.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteSlug(venue.slug)}
                              aria-label={`Eliminar ${venue.name}`}
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
          Página {page} de {totalPages} • {totalCount} resultados
        </span>
        <div className="w-full md:w-auto">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <VenueDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        venue={editingVenue}
      />

      <AlertDialog
        open={deleteSlug !== null}
        onOpenChange={() => setDeleteSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar espacio?</AlertDialogTitle>
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
    </PageContainer>
  );
}
