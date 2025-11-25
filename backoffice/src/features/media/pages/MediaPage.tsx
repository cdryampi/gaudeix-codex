import { useEffect, useMemo, useRef, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { mediaApi } from "../api/media";
import { MediaItem, MediaType } from "../types";
import { MediaTable } from "../components/MediaTable";
import { MediaFilters } from "../components/MediaFilters";

export function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = typeFilter === "all" ? true : item.type === typeFilter;
      const matchesSearch = item.original_name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [items, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const [images, documents] = await Promise.all([
        mediaApi.listImages(),
        mediaApi.listDocuments(),
      ]);
      setItems([...images, ...documents]);
      setError(null);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Error al cargar los archivos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await mediaApi.upload(file);
      await fetchMedia();
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      alert("No se pudo subir el archivo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (confirm(`¿Eliminar "${item.original_name}"?`)) {
      try {
        await mediaApi.delete(item.type, item.id);
        await fetchMedia();
      } catch (err) {
        console.error("Error eliminando archivo:", err);
        alert("No se pudo eliminar el archivo.");
      }
    }
  };

  const handleRename = async (item: MediaItem) => {
    const newName = prompt("Nuevo nombre de archivo", item.original_name);
    if (!newName || newName === item.original_name) return;
    try {
      await mediaApi.rename(item.type, item.id, newName);
      await fetchMedia();
    } catch (err) {
      console.error("Error renombrando archivo:", err);
      alert("No se pudo renombrar el archivo.");
    }
  };

  const handlePageChange = (nextPage: number) => {
    const target = Math.min(Math.max(1, nextPage), totalPages);
    setPage(target);
  };

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, pageSize]);

  return (
    <PageContainer>
      <PageHeader
        title="Media"
        description="Gestión de archivos multimedia"
        actions={
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Subir Archivo
            </Button>
          </>
        }
      />

      <MediaFilters
        search={search}
        onSearch={setSearch}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        pageSize={pageSize}
        onPageSize={setPageSize}
      />

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando archivos...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-red-500">
              {error}
            </div>
          ) : (
            <MediaTable
              items={paginated}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {page} de {totalPages} • {filtered.length} resultados
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
            Siguiente
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
