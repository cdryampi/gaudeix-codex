/**
 * Routes management page.
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
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { RouteDialog } from "../components/RouteDialog";
import { RoutesFilters } from "../components/RoutesFilters";
import { RoutesTable } from "../components/RoutesTable";
import { CreateRouteDTO, DifficultyLevel, Route, RouteType } from "../types";
import { routesApi } from "../api/routes";

export function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog/Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [routeType, setRouteType] = useState<RouteType | "">("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "">("");
  const [isCircular, setIsCircular] = useState<boolean | "">("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return routes.filter((route) => {
      // Status Filter
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? route.is_published
            : !route.is_published;
      if (!matchesStatus) return false;

      // Route Type Filter
      if (routeType && route.route_type !== routeType) return false;

      // Difficulty Filter
      if (difficulty && route.difficulty !== difficulty) return false;

      // Circular Filter
      if (isCircular !== "" && route.is_circular !== isCircular) return false;

      // Search Filter
      if (search) {
        const text =
          `${route.title} ${route.summary ?? ""} ${route.description ?? ""} ${route.slug}`.toLowerCase();
        return text.includes(search.toLowerCase());
      }

      return true;
    });
  }, [routes, search, status, routeType, difficulty, isCircular]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routesApi.getAll();
      setRoutes(data);
      // Sync editingRoute with fresh data so dialog gets updated gpx_file, etc.
      setEditingRoute((prev) => {
        if (!prev) return prev;
        const fresh = data.find((r) => r.slug === prev.slug);
        return fresh ?? prev;
      });
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Error al cargar las rutas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingRoute(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setIsDialogOpen(true);
  };

  const handleDelete = (slug: string) => {
    setDeleteSlug(slug);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await routesApi.delete(deleteSlug);
      await fetchData();
      toast.success("Ruta eliminada correctamente");
    } catch (err) {
      console.error("Error deleting route:", err);
      toast.error("No se pudo eliminar la ruta");
    } finally {
      setDeleteSlug(null);
    }
  };

  const handleSubmit = async (data: CreateRouteDTO) => {
    try {
      if (editingRoute) {
        await routesApi.update(editingRoute.slug, data);
        toast.success("Ruta actualizada correctamente");
      } else {
        await routesApi.create(data);
        toast.success("Ruta creada correctamente");
      }
      setIsDialogOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving route:", err);
      toast.error("No se pudo guardar la ruta");
    }
  };

  const handleRouteGenerated = (updatedRoute: Route) => {
    setRoutes((prev) =>
      prev.map((route) =>
        route.slug === updatedRoute.slug ? updatedRoute : route,
      ),
    );
    setEditingRoute((prev) =>
      prev?.slug === updatedRoute.slug ? updatedRoute : prev,
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Rutas"
        description="Gestiona las rutas de senderismo y ciclismo"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva ruta
          </Button>
        }
      />

      <RoutesFilters
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
        routeType={routeType}
        onRouteType={(v) => {
          setRouteType(v);
          setPage(1);
        }}
        difficulty={difficulty}
        onDifficulty={(v) => {
          setDifficulty(v);
          setPage(1);
        }}
        isCircular={isCircular}
        onIsCircular={(v) => {
          setIsCircular(v);
          setPage(1);
        }}
      />

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando rutas...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <RoutesTable
              routes={paginated}
              onEdit={handleEdit}
              onDelete={handleDelete}
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

      <RouteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        onRouteGenerated={handleRouteGenerated}
        route={editingRoute}
      />

      <AlertDialog
        open={deleteSlug !== null}
        onOpenChange={() => setDeleteSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La ruta será eliminada
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
