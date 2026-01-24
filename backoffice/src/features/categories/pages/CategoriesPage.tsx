import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { categoriesApi } from "../api/categories";
import { Category, CategoryPayload } from "../types";
import { CategoriesTable } from "../components/CategoriesTable";
import { CategoryDialog } from "../components/CategoryDialog";
import { envConfig } from "@/lib/config/env";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(envConfig.events.pageSizeDefault);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter((c) => {
      const parentText = c.parent ? `parent:${c.parent}` : "";
      return `${c.slug} ${c.nombre} ${c.descripcion} ${c.icon || ""} ${c.taxonomy || ""} ${parentText}`
        .toLowerCase()
        .includes(q);
    });
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (payload: CategoryPayload) => {
    try {
      if (editing) {
        await categoriesApi.update(editing.id, payload);
        toast.success("Categoría actualizada");
      } else {
        await categoriesApi.create(payload);
        toast.success("Categoría creada");
      }
      setDialogOpen(false);
      setEditing(undefined);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la categoría");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoriesApi.remove(id);
      toast.success("Categoría eliminada");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la categoría");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Categorías"
        description="Gestiona categorías y sus traducciones"
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Buscar por slug o nombre"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">Cargando...</div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-destructive">{error}</div>
          ) : (
            <CategoriesTable
              categories={paginated}
              onEdit={(c) => {
                setEditing(c);
                setDialogOpen(true);
              }}
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        category={editing}
        categories={categories}
      />
    </PageContainer>
  );
}
