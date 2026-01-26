import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { MediaTable } from "../components/MediaTable";
import { MediaFilters } from "../components/MediaFilters";
import { eventsApi } from "@/features/events/api/events";
import { placesApi } from "@/features/places/api/places";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { siteSettingsApi } from "@/features/site-settings/api/siteSettings";
const fallbackLabel = (value, fallback) =>
  value && value.trim().length > 0 ? value : fallback;
function addEventLinks(events, addLink) {
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
function addPlaceLinks(places, addLink) {
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
function addStaticPageLinks(pages, addLink) {
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
function addSiteSettingsLinks(settings, addLink) {
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteItem, setDeleteItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [newName, setNewName] = useState("");
  const [linkedMap, setLinkedMap] = useState({});
  const fileInputRef = useRef(null);
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
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const [images, documents] = await Promise.all([
        mediaApi.listImages(),
        mediaApi.listDocuments(),
      ]);
      const merged = [...images, ...documents];
      setItems(merged);
      setLinkedMap(await loadLinkedMap());
      setError(null);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Error al cargar los archivos.");
    } finally {
      setLoading(false);
    }
  };
  const loadLinkedMap = async () => {
    const [eventsResult, placesResult, pagesResult, settingsResult] =
      await Promise.allSettled([
        eventsApi.getAll(),
        placesApi.getAll(),
        staticPagesApi.list(),
        siteSettingsApi.get(),
      ]);
    const linked = {};
    const addLink = (type, id, link) => {
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
  };
  useEffect(() => {
    fetchMedia();
  }, []);
  const handleUpload = async (event) => {
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
  const handleDelete = async (item) => {
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
  const handleRename = async (item) => {
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
  return _jsxs(PageContainer, {
    children: [
      _jsx(PageHeader, {
        title: "Media",
        description: "Gesti\u00F3n de archivos multimedia",
        actions: _jsxs(_Fragment, {
          children: [
            _jsx("input", {
              type: "file",
              ref: fileInputRef,
              onChange: handleUpload,
              className: "hidden",
            }),
            _jsxs(Button, {
              onClick: () => fileInputRef.current?.click(),
              size: "sm",
              children: [
                _jsx(Upload, { className: "mr-2 h-4 w-4" }),
                "Subir archivo",
              ],
            }),
          ],
        }),
      }),
      _jsx(MediaFilters, {
        search: search,
        onSearch: setSearch,
        typeFilter: typeFilter,
        onTypeFilter: setTypeFilter,
        pageSize: pageSize,
        onPageSize: setPageSize,
      }),
      _jsx(Card, {
        className: "border-border bg-card",
        children: _jsx(CardContent, {
          className: "p-0",
          children: loading
            ? _jsx("div", {
                className:
                  "flex h-48 items-center justify-center text-muted-foreground",
                children: "Cargando archivos...",
              })
            : error
              ? _jsx("div", {
                  className:
                    "flex h-48 items-center justify-center text-destructive",
                  children: error,
                })
              : _jsx(MediaTable, {
                  items: paginated,
                  onDelete: handleDelete,
                  onRename: handleRename,
                  linkedMap: linkedMap,
                }),
        }),
      }),
      _jsxs("div", {
        className:
          "mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between",
        children: [
          _jsxs("span", {
            children: [
              "P\u00E1gina ",
              page,
              " de ",
              totalPages,
              " \u2022 ",
              filtered.length,
              " resultados",
            ],
          }),
          _jsx("div", {
            className: "w-full md:w-auto",
            children: _jsx(Pagination, {
              page: page,
              totalPages: totalPages,
              onPageChange: setPage,
            }),
          }),
        ],
      }),
      _jsx(AlertDialog, {
        open: deleteItem !== null,
        onOpenChange: () => setDeleteItem(null),
        children: _jsxs(AlertDialogContent, {
          children: [
            _jsxs(AlertDialogHeader, {
              children: [
                _jsx(AlertDialogTitle, {
                  children: "\u00BFEst\u00E1s seguro?",
                }),
                _jsxs(AlertDialogDescription, {
                  children: [
                    'Esta acci\u00F3n no se puede deshacer. El archivo "',
                    deleteItem?.original_name,
                    '" ser\u00E1 eliminado permanentemente.',
                  ],
                }),
              ],
            }),
            _jsxs(AlertDialogFooter, {
              children: [
                _jsx(AlertDialogCancel, { children: "Cancelar" }),
                _jsx(AlertDialogAction, {
                  onClick: handleDeleteConfirm,
                  className:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  children: "Eliminar",
                }),
              ],
            }),
          ],
        }),
      }),
      _jsx(Dialog, {
        open: renameItem !== null,
        onOpenChange: () => setRenameItem(null),
        children: _jsxs(DialogContent, {
          children: [
            _jsxs(DialogHeader, {
              children: [
                _jsx(DialogTitle, { children: "Renombrar archivo" }),
                _jsxs(DialogDescription, {
                  children: [
                    'Introduce el nuevo nombre para "',
                    renameItem?.original_name,
                    '"',
                  ],
                }),
              ],
            }),
            _jsx("div", {
              className: "grid gap-4 py-4",
              children: _jsxs("div", {
                className: "grid gap-2",
                children: [
                  _jsx(Label, { htmlFor: "newName", children: "Nuevo nombre" }),
                  _jsx(Input, {
                    id: "newName",
                    value: newName,
                    onChange: (e) => setNewName(e.target.value),
                    onKeyDown: (e) =>
                      e.key === "Enter" && handleRenameConfirm(),
                  }),
                ],
              }),
            }),
            _jsxs(DialogFooter, {
              children: [
                _jsx(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: () => setRenameItem(null),
                  children: "Cancelar",
                }),
                _jsx(Button, {
                  type: "button",
                  onClick: handleRenameConfirm,
                  children: "Renombrar",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
