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

import { accommodationsApi } from "../api/accommodations";
import type { Accommodation, AccommodationPayload } from "../types";
import { AccommodationsFilters } from "../components/AccommodationsFilters";
import { AccommodationsTable } from "../components/AccommodationsTable";
import { AccommodationDialog } from "../components/AccommodationDialog";

export function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Accommodation | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return accommodations.filter((a) => {
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? a.is_published
            : !a.is_published;
      const text =
        `${a.title} ${a.description ?? ""} ${a.location_text ?? ""}`.toLowerCase();
      return matchesStatus && text.includes(search.toLowerCase());
    });
  }, [accommodations, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      setError(null);
      setAccommodations(await accommodationsApi.getAll());
    } catch {
      setError("No se pudieron cargar los alojamientos.");
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAccommodations();
  }, []);

  const handleSubmit = async (payload: AccommodationPayload) => {
    try {
      if (editing) {
        await accommodationsApi.update(editing.slug, payload);
        toast.success("Alojamiento actualizado");
      } else {
        await accommodationsApi.create(payload);
        toast.success("Alojamiento creado");
      }
      setDialogOpen(false);
      setEditing(undefined);
      await fetchAccommodations();
    } catch {
      toast.error("No se pudo guardar el alojamiento");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await accommodationsApi.delete(deleteSlug);
      toast.success("Alojamiento eliminado");
      await fetchAccommodations();
    } catch {
      toast.error("No se pudo eliminar el alojamiento");
    } finally {
      setDeleteSlug(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Alojamientos"
        description="Gestiona los alojamientos del municipio"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo alojamiento
          </Button>
        }
      />
      <AccommodationsFilters
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
              Cargando alojamientos...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <AccommodationsTable
              accommodations={paginated}
              onEdit={(a) => {
                setEditing(a);
                setDialogOpen(true);
              }}
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
      <AccommodationDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        accommodation={editing}
      />
      <AlertDialog
        open={deleteSlug !== null}
        onOpenChange={() => setDeleteSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar alojamiento?</AlertDialogTitle>
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
