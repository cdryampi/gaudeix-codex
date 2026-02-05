/**
 * NewsPage - Main page for news management in backoffice
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
import { NewsDialog } from "../components/NewsDialog";
import { NewsFilters } from "../components/NewsFilters";
import { NewsTable } from "../components/NewsTable";
import { CreateNewsDTO, News } from "../types";
import { newsApi } from "../api/news";
import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";

export function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog/Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | undefined>();
  const [deleteNews, setDeleteNews] = useState<News | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [category, setCategory] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return news.filter((item) => {
      // 1. Status Filter
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? item.is_published
            : !item.is_published;
      if (!matchesStatus) return false;

      // 2. Category Filter
      if (category && item.category_slug !== category) return false;

      // 3. Search Filter (Text)
      if (search) {
        const text =
          `${item.title} ${item.excerpt ?? ""} ${item.content ?? ""} ${item.category_name ?? ""}`.toLowerCase();
        return text.includes(search.toLowerCase());
      }

      return true;
    });
  }, [news, search, status, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [newsData, categoriesData] = await Promise.all([
        newsApi.getAll(),
        categoriesApi.list({ taxonomy: "news" }),
      ]);
      setNews(newsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching news data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingNews(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: News) => {
    setEditingNews(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (newsItem: News) => {
    setDeleteNews(newsItem);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteNews) return;
    try {
      await newsApi.delete(deleteNews.id);
      await fetchData();
      toast.success("Noticia eliminada correctamente");
    } catch (err) {
      console.error("Error deleting news:", err);
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) {
        setNews((prev) => prev.filter((item) => item.id !== deleteNews.id));
        await fetchData();
        toast.error("La noticia ya no existe. Lista actualizada.");
      } else {
        toast.error("No se pudo eliminar la noticia");
      }
    } finally {
      setDeleteNews(null);
    }
  };

  const handleSubmit = async (data: CreateNewsDTO) => {
    try {
      if (editingNews) {
        await newsApi.update(editingNews.slug, data);
        toast.success("Noticia actualizada correctamente");
      } else {
        await newsApi.create(data);
        toast.success("Noticia creada correctamente");
      }
      setIsDialogOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving news:", err);
      toast.error("No se pudo guardar la noticia");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Noticias"
        description="Gestiona las noticias publicadas y borradores"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva noticia
          </Button>
        }
      />

      <NewsFilters
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
      />

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando noticias...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <NewsTable
              news={paginated}
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

      <NewsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        news={editingNews}
      />

      <AlertDialog
        open={deleteNews !== null}
        onOpenChange={() => setDeleteNews(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La noticia será eliminada
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
