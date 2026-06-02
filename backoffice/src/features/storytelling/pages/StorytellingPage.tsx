/**
 * StorytellingPage - Main page for storytelling management in backoffice
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
import { StoryDialog } from "../components/StoryDialog";
import { StoryFilters } from "../components/StoryFilters";
import { StoryTable } from "../components/StoryTable";
import { CreateStoryDTO, Story } from "../types";
import { storytellingApi } from "../api/storytelling";
import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";

export function StorytellingPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog/Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | undefined>();
  const [deleteStory, setDeleteStory] = useState<Story | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [historicalPeriod, setHistoricalPeriod] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return stories.filter((item) => {
      // 1. Status Filter
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? item.is_published
            : !item.is_published;
      if (!matchesStatus) return false;

      // 2. Category Filter
      if (category && item.category?.slug !== category) return false;

      // 3. Difficulty Filter
      if (difficulty && item.difficulty !== difficulty) return false;

      if (historicalPeriod && item.historical_period !== historicalPeriod) {
        return false;
      }

      // 4. Search Filter (Text)
      if (search) {
        const text =
          `${item.title} ${item.summary ?? ""} ${item.content ?? ""} ${item.historical_period ?? ""} ${item.source_name ?? ""}`.toLowerCase();
        return text.includes(search.toLowerCase());
      }

      return true;
    });
  }, [stories, search, status, category, difficulty, historicalPeriod]);

  const periods = useMemo(
    () =>
      Array.from(
        new Set(stories.map((item) => item.historical_period).filter(Boolean)),
      ).sort(),
    [stories],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [storiesData, categoriesData] = await Promise.all([
        storytellingApi.getAll(),
        categoriesApi.list({ taxonomy: "story_type" }),
      ]);
      setStories(storiesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching storytelling data:", err);
      setError("Error al cargar los datos del relato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingStory(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Story) => {
    setEditingStory(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (storyItem: Story) => {
    setDeleteStory(storyItem);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteStory) return;
    try {
      await storytellingApi.delete(deleteStory.slug);
      await fetchData();
      toast.success("Relato eliminado correctamente");
    } catch (err) {
      console.error("Error deleting story:", err);
      toast.error("No se pudo eliminar el relato");
    } finally {
      setDeleteStory(null);
    }
  };

  const handleSubmit = async (data: CreateStoryDTO) => {
    try {
      if (editingStory) {
        await storytellingApi.update(editingStory.slug, data);
        toast.success("Relato actualizado correctamente");
      } else {
        await storytellingApi.create(data);
        toast.success("Relato creado correctamente");
      }
      setIsDialogOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving story:", err);
      toast.error("No se pudo guardar el relato");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Storytelling de Cabrera de Mar"
        description="Gestiona las historias, leyendas y relatos arqueológicos del municipio."
        actions={
          <Button
            onClick={handleCreate}
            size="sm"
            className="bg-primary-700 hover:bg-primary-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo relato
          </Button>
        }
      />

      <StoryFilters
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
        difficulty={difficulty}
        onDifficulty={(v) => {
          setDifficulty(v);
          setPage(1);
        }}
        historicalPeriod={historicalPeriod}
        onHistoricalPeriod={(v) => {
          setHistoricalPeriod(v);
          setPage(1);
        }}
        periods={periods}
      />

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">
              Cargando relatos...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : (
            <StoryTable
              stories={paginated}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
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

      <StoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        story={editingStory}
      />

      <AlertDialog
        open={deleteStory !== null}
        onOpenChange={() => setDeleteStory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El relato será eliminado
              permanentemente del sistema.
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
