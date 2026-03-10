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
import { Plus, Waves } from "lucide-react";
import { toast } from "sonner";

import { beachesApi } from "../api/beaches";
import { Beach, BeachPayload } from "../types";
import { BeachesFilters } from "../components/BeachesFilters";
import { BeachesTable } from "../components/BeachesTable";
import { BeachDialog } from "../components/BeachDialog";

export function BeachesPage() {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Beach | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return beaches.filter((beach) => {
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? beach.is_published
            : !beach.is_published;
      const text =
        `${beach.title} ${beach.description ?? ""} ${beach.location_text ?? ""} ${beach.environment_summary ?? ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [beaches, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchBeaches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await beachesApi.getAll();
      setBeaches(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las playas.");
      setBeaches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBeaches();
  }, []);

  const handleCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (beach: Beach) => {
    setEditing(beach);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload: BeachPayload) => {
    try {
      if (editing) {
        await beachesApi.update(editing.slug, payload);
        toast.success("Playa actualizada");
      } else {
        await beachesApi.create(payload);
        toast.success("Playa creada");
      }
      setDialogOpen(false);
      setEditing(undefined);
      await fetchBeaches();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la playa");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await beachesApi.delete(deleteSlug);
      toast.success("Playa eliminada");
      await fetchBeaches();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la playa");
    } finally {
      setDeleteSlug(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Playas"
        description="Gestiona la micro-experiencia turística de las playas del municipio"
        actions={
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
              <Waves className="h-3.5 w-3.5" />
              Costa
            </div>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva playa
            </Button>
          </>
        }
      />

      <BeachesFilters
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatus={(value) => {
          setStatus(value);
          setPage(1);
        }}
        pageSize={pageSize}
        onPageSize={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando playas...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <BeachesTable
              beaches={paginated}
              onEdit={handleEdit}
              onDelete={setDeleteSlug}
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

      <BeachDialog
        open={dialogOpen}
        onOpenChange={(value) => {
          setDialogOpen(value);
          if (!value) setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        beach={editing}
      />

      <AlertDialog
        open={deleteSlug !== null}
        onOpenChange={() => setDeleteSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar playa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer y eliminará la playa del portal y
              del backoffice.
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
