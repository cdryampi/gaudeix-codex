import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { mediaApi } from "../api/media";
import { MediaItem, MediaType } from "../types";
import { MediaLink, MediaTable } from "../components/MediaTable";
import { MediaFilters } from "../components/MediaFilters";
import { eventsApi } from "@/features/events/api/events";
import { placesApi } from "@/features/places/api/places";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { siteSettingsApi } from "@/features/site-settings/api/siteSettings";
import { Event } from "@/features/events/types";
import { Place } from "@/features/places/types";
import { StaticPage } from "@/features/static-pages/types";
import { SiteSettings } from "@/features/site-settings/types";

type LinkCollector = (
  type: MediaType,
  id: number | null | undefined,
  link: MediaLink,
) => void;

const fallbackLabel = (value: string | undefined | null, fallback: string) =>
  value && value.trim().length > 0 ? value : fallback;

function addEventLinks(events: Event[], addLink: LinkCollector) {
  events.forEach((event) => {
    const title = fallbackLabel(event.title, `Evento #${event.id}`);
    if (event.featured_media?.id) {
      addLink("image", event.featured_media.id, {
        label: "Evento",
        subtitle: title,
      });
    }
    (event.attachments || []).forEach((attachment) => {
      addLink("document", attachment.id, { label: "Evento", subtitle: title });
    });
  });
}

function addPlaceLinks(places: Place[], addLink: LinkCollector) {
  places.forEach((place) => {
    const title = fallbackLabel(place.title, `Lugar #${place.id}`);
    if (place.featured_media?.id) {
      addLink("image", place.featured_media.id, {
        label: "Lugar",
        subtitle: title,
      });
    }
    (place.attachments || []).forEach((attachment) => {
      addLink("document", attachment.id, { label: "Lugar", subtitle: title });
    });
  });
}

function addStaticPageLinks(pages: StaticPage[], addLink: LinkCollector) {
  pages.forEach((page) => {
    const title = fallbackLabel(page.titulo, `Página ${page.slug}`);
    if (page.featured_media?.id) {
      addLink("image", page.featured_media.id, {
        label: "Página",
        subtitle: title,
      });
    }
    if (page.attachment?.id) {
      addLink("document", page.attachment.id, {
        label: "Página",
        subtitle: title,
      });
    }
  });
}

function addSiteSettingsLinks(settings: SiteSettings, addLink: LinkCollector) {
  addLink("image", settings.logo?.id, { label: "Ajustes", subtitle: "Logo" });
  addLink("image", settings.logo_dark?.id, {
    label: "Ajustes",
    subtitle: "Logo dark",
  });
  addLink("image", settings.favicon?.id, {
    label: "Ajustes",
    subtitle: "Favicon",
  });
  addLink("image", settings.default_og_image?.id, {
    label: "Ajustes",
    subtitle: "OG image",
  });
  addLink("video", settings.background_video?.id, {
    label: "Ajustes",
    subtitle: "Video fondo",
  });
}

export function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [renameItem, setRenameItem] = useState<MediaItem | null>(null);
  const [newName, setNewName] = useState("");
  const [linkedMap, setLinkedMap] = useState<Record<string, MediaLink[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        typeFilter === "all" ? true : item.type === typeFilter;
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

  const loadLinkedMap = useCallback(async (): Promise<
    Record<string, MediaLink[]>
  > => {
    const [eventsResult, placesResult, pagesResult, settingsResult] =
      await Promise.allSettled([
        eventsApi.getAll(),
        placesApi.getAll(),
        staticPagesApi.list(),
        siteSettingsApi.get(),
      ]);

    const linked: Record<string, MediaLink[]> = {};
    const addLink = (
      type: MediaType,
      id: number | null | undefined,
      link: MediaLink,
    ) => {
      if (!id) return;
      const key = `${type}-${id}`;
      if (!linked[key]) linked[key] = [];
      linked[key].push(link);
    };

    const events =
      eventsResult.status === "fulfilled" ? eventsResult.value : [];
    const places =
      placesResult.status === "fulfilled" ? placesResult.value : [];
    const pages = pagesResult.status === "fulfilled" ? pagesResult.value : [];
    const settings =
      settingsResult.status === "fulfilled" ? settingsResult.value : null;

    addEventLinks(events, addLink);
    addPlaceLinks(places, addLink);
    addStaticPageLinks(pages, addLink);
    if (settings) addSiteSettingsLinks(settings, addLink);

    return linked;
  }, []);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const [images, documents, videos] = await Promise.all([
        mediaApi.listImages(),
        mediaApi.listDocuments(),
        mediaApi.listVideos(),
      ]);
      const merged = [...images, ...documents, ...videos];
      setItems(merged);
      setLinkedMap(await loadLinkedMap());
      setError(null);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Error al cargar los archivos.");
    } finally {
      setLoading(false);
    }
  }, [loadLinkedMap]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await mediaApi.upload(file);
      await fetchMedia();
      toast.success("Archivo subido correctamente");
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      toast.error("No se pudo subir el archivo");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: MediaItem) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    try {
      await mediaApi.delete(deleteItem.type, deleteItem.id);
      await fetchMedia();
      toast.success("Archivo eliminado correctamente");
    } catch (err) {
      console.error("Error eliminando archivo:", err);
      toast.error("No se pudo eliminar el archivo");
    } finally {
      setDeleteItem(null);
    }
  };

  const handleRename = async (item: MediaItem) => {
    setRenameItem(item);
    setNewName(item.original_name);
  };

  const handleRenameConfirm = async () => {
    if (!renameItem || !newName || newName === renameItem.original_name) {
      setRenameItem(null);
      return;
    }

    try {
      await mediaApi.rename(renameItem.type, renameItem.id, newName);
      await fetchMedia();
      toast.success("Archivo renombrado correctamente");
    } catch (err) {
      console.error("Error renombrando archivo:", err);
      toast.error("No se pudo renombrar el archivo");
    } finally {
      setRenameItem(null);
      setNewName("");
    }
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
            <Button onClick={() => fileInputRef.current?.click()} size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Subir archivo
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

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando archivos...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <MediaTable
              items={paginated}
              onDelete={handleDelete}
              onRename={handleRename}
              linkedMap={linkedMap}
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

      <AlertDialog
        open={deleteItem !== null}
        onOpenChange={() => setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo "
              {deleteItem?.original_name}" será eliminado permanentemente.
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

      <Dialog
        open={renameItem !== null}
        onOpenChange={() => setRenameItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar archivo</DialogTitle>
            <DialogDescription>
              Introduce el nuevo nombre para "{renameItem?.original_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newName">Nuevo nombre</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameItem(null)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleRenameConfirm}>
              Renombrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
