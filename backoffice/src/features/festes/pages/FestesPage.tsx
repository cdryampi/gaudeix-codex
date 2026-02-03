/**
 * Festes management page.
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
import { FestaDialog } from "../components/FestaDialog";
import { FestesFilters } from "../components/FestesFilters";
import { FestesTable } from "../components/FestesTable";
import { CreateFestaDTO, Festa } from "../types";
import { festesApi } from "../api/festes";

export function FestesPage() {
  const [festes, setFestes] = useState<Festa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog/Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFesta, setEditingFesta] = useState<Festa | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [year, setYear] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get unique years from festes
  const years = useMemo(() => {
    const uniqueYears = [...new Set(festes.map((f) => f.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [festes]);

  const filtered = useMemo(() => {
    return festes.filter((festa) => {
      // Status Filter
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? festa.is_published
            : !festa.is_published;
      if (!matchesStatus) return false;

      // Year Filter
      if (year && festa.year !== Number(year)) return false;

      // Search Filter
      if (search) {
        const text =
          `${festa.title} ${festa.subtitle ?? ""} ${festa.summary ?? ""} ${festa.slug}`.toLowerCase();
        return text.includes(search.toLowerCase());
      }

      return true;
    });
  }, [festes, search, status, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await festesApi.getAll();
      setFestes(data);
    } catch (err) {
      console.error("Error fetching festes:", err);
      setError("Error al cargar las festes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingFesta(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (festa: Festa) => {
    setEditingFesta(festa);
    setIsDialogOpen(true);
  };

  const handleDelete = (slug: string) => {
    setDeleteSlug(slug);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await festesApi.delete(deleteSlug);
      await fetchData();
      toast.success("Festa eliminada correctamente");
    } catch (err) {
      console.error("Error deleting festa:", err);
      toast.error("No se pudo eliminar la festa");
    } finally {
      setDeleteSlug(null);
    }
  };

  const handleSubmit = async (data: CreateFestaDTO) => {
    try {
      if (editingFesta) {
        await festesApi.update(editingFesta.slug, data);
        toast.success("Festa actualizada correctamente");
      } else {
        await festesApi.create(data);
        toast.success("Festa creada correctamente");
      }
      setIsDialogOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving festa:", err);
      toast.error("No se pudo guardar la festa");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Festes"
        description="Gestiona las Festes Majors y eventos especiales"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva festa
          </Button>
        }
      />

      <FestesFilters
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
        year={year}
        onYear={(v) => {
          setYear(v);
          setPage(1);
        }}
        years={years}
      />

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando festes...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <FestesTable
              festes={paginated}
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

      <FestaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        festa={editingFesta}
      />

      <AlertDialog
        open={deleteSlug !== null}
        onOpenChange={() => setDeleteSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La festa será eliminada
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
