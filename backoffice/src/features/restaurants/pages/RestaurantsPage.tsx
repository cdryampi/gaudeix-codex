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
import { Pagination } from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { restaurantsApi } from "../api/restaurants";
import type { Restaurant, RestaurantPayload } from "../types";
import { RestaurantsFilters } from "../components/RestaurantsFilters";
import { RestaurantsTable } from "../components/RestaurantsTable";
import { RestaurantDialog } from "../components/RestaurantDialog";

export function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? r.is_published
            : !r.is_published;
      const text =
        `${r.title} ${r.description ?? ""} ${r.location_text ?? ""}`.toLowerCase();
      return matchesStatus && text.includes(search.toLowerCase());
    });
  }, [restaurants, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantsApi.getAll();
      setRestaurants(data);
    } catch {
      setError("No se pudieron cargar los restaurantes.");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRestaurants();
  }, []);

  const handleSubmit = async (payload: RestaurantPayload) => {
    try {
      if (editing) {
        await restaurantsApi.update(editing.slug, payload);
        toast.success("Restaurante actualizado");
      } else {
        await restaurantsApi.create(payload);
        toast.success("Restaurante creado");
      }
      setDialogOpen(false);
      setEditing(undefined);
      await fetchRestaurants();
    } catch {
      toast.error("No se pudo guardar el restaurante");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await restaurantsApi.delete(deleteSlug);
      toast.success("Restaurante eliminado");
      await fetchRestaurants();
    } catch {
      toast.error("No se pudo eliminar el restaurante");
    } finally {
      setDeleteSlug(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Restaurantes"
        description="Gestiona los restaurantes del municipio"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo restaurante
          </Button>
        }
      />

      <RestaurantsFilters
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
              Cargando restaurantes...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <RestaurantsTable
              restaurants={paginated}
              onEdit={setEditing}
              onDelete={setDeleteSlug}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Página {page} de {totalPages} &bull; {filtered.length} resultados
        </span>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <RestaurantDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        restaurant={editing}
      />

      <AlertDialog
        open={deleteSlug !== null}
        onOpenChange={() => setDeleteSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar restaurante?</AlertDialogTitle>
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
