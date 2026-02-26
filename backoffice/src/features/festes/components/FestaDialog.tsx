/**
 * Festa create/edit dialog component.
 */
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/config/constants";
import { CreateFestaDTO, Festa } from "../types";
import { mediaApi } from "@/features/media/api/media";
import { MediaItem } from "@/features/media/types";
import { eventsApi } from "@/features/events/api/events";
import { Event } from "@/features/events/types";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { ImageSelector } from "@/features/media/components/ImageSelector";
import { toast } from "sonner";

type LocalTranslations = {
  [lang: string]: {
    title: string;
    subtitle?: string;
    summary?: string;
    description?: string;
    program_text?: string;
  };
};

const emptyForm: CreateFestaDTO = {
  title: "",
  subtitle: "",
  summary: "",
  description: "",
  program_text: "",
  start_date: "",
  end_date: "",
  year: new Date().getFullYear(),
  is_published: false,
  is_featured: false,
  is_current: false,
  translations: {},
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFestaDTO) => void;
  festa?: Festa;
};

export function FestaDialog({ open, onOpenChange, onSubmit, festa }: Props) {
  const [form, setForm] = useState<CreateFestaDTO>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const docInputRef = useRef<HTMLInputElement>(null);

  const [isFeaturedMediaSelectorOpen, setIsFeaturedMediaSelectorOpen] =
    useState(false);
  const [isPosterSelectorOpen, setIsPosterSelectorOpen] = useState(false);
  const [isGallerySelectorOpen, setIsGallerySelectorOpen] = useState(false);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const [imgs, docs, evts] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          eventsApi.getAll(),
        ]);
        setImages(imgs);
        setDocuments(docs);
        setAllEvents(evts);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };
    if (open) loadMedia();
  }, [open]);

  useEffect(() => {
    if (festa) {
      setForm({
        title: festa.title,
        subtitle: festa.subtitle || "",
        summary: festa.summary || "",
        description: festa.description || "",
        program_text: festa.program_text || "",
        start_date: festa.start_date,
        end_date: festa.end_date,
        year: festa.year,
        is_published: festa.is_published,
        is_featured: festa.is_featured,
        is_current: festa.is_current,
        category_id: festa.category ?? null,
        featured_media_id: festa.featured_media?.id ?? null,
        poster_ids: festa.posters?.map((img) => img.id) || [],
        program_pdf_id: festa.program_pdf?.id ?? null,
        gallery_ids: festa.gallery?.map((img) => img.id) || [],
        event_ids: festa.events?.map((e) => e.id) || [],
      });
      setTranslations(festa.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [festa?.id, open]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return {
        title: form.title,
        subtitle: form.subtitle,
        summary: form.summary,
        description: form.description,
        program_text: form.program_text,
      };
    }
    const trans = translations[lang] || {
      title: "",
      subtitle: "",
      summary: "",
      description: "",
      program_text: "",
    };
    return {
      title: trans.title || "",
      subtitle: trans.subtitle || "",
      summary: trans.summary || "",
      description: trans.description || "",
      program_text: trans.program_text || "",
    };
  };

  const updateTranslatedField = (
    lang: string,
    field: "title" | "subtitle" | "summary" | "description" | "program_text",
    value: string,
  ) => {
    if (lang === "ca") {
      setForm((prev) => ({ ...prev, [field]: value }));
      return;
    }
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const translationsPayload: LocalTranslations = { ...translations };
    delete translationsPayload["ca"];

    onSubmit({
      ...form,
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    });
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await mediaApi.upload(file);
      if (uploaded.type === "document") {
        setDocuments((prev) => [uploaded, ...prev]);
        setForm((prev) => ({ ...prev, program_pdf_id: uploaded.id }));
        toast.success("Documento subido correctamente");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al subir el documento");
    } finally {
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const selectedPosters = useMemo(() => {
    return (form.poster_ids || [])
      .map((id) => images.find((i) => i.id === id))
      .filter(Boolean) as MediaItem[];
  }, [form.poster_ids, images]);

  const selectedGallery = useMemo(() => {
    const ids = form.gallery_ids || [];
    return ids
      .map((id) => images.find((img) => img.id === id))
      .filter((img): img is MediaItem => !!img);
  }, [images, form.gallery_ids]);

  const selectedEvents = useMemo(() => {
    return (form.event_ids || [])
      .map((id) => allEvents.find((e) => e.id === id))
      .filter((e): e is Event => !!e);
  }, [allEvents, form.event_ids]);

  const handleMoveEvent = (index: number, direction: "up" | "down") => {
    const list = [...(form.event_ids || [])];
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setForm((prev) => ({ ...prev, event_ids: list }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{festa ? "Editar festa" : "Nueva festa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dates and Year */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Año</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    year: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha inicio</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid gap-6 md:grid-cols-3 p-4 border border-border rounded-xl bg-muted/10">
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!form.is_published}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_published: e.target.checked,
                    }))
                  }
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Publicada
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!form.is_featured}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_featured: e.target.checked,
                    }))
                  }
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Destacada
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!form.is_current}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_current: e.target.checked,
                    }))
                  }
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Festa actual
                </span>
              </label>
              <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                Solo puede haber una festa actual a la vez.
              </p>
            </div>
          </div>

          {/* Translations */}
          <Tabs value={activeLang} onValueChange={setActiveLang}>
            <TabsList className="grid w-full grid-cols-4">
              {LANGUAGES.map((lang) => (
                <TabsTrigger key={lang.code} value={lang.code}>
                  {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map((lang) => {
              const content = getContent(lang.code);
              const isBase = lang.code === "ca";
              return (
                <TabsContent
                  key={lang.code}
                  value={lang.code}
                  className="space-y-3 pt-4"
                >
                  <div className="space-y-2">
                    <Label>Título {isBase ? "" : `(${lang.name})`}</Label>
                    <Input
                      value={content.title || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "title",
                          e.target.value,
                        )
                      }
                      required={isBase}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={content.subtitle || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "subtitle",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resumen breve</Label>
                    <Textarea
                      value={content.summary || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "summary",
                          e.target.value,
                        )
                      }
                      className="min-h-[72px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={content.description || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "description",
                          e.target.value,
                        )
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Texto del programa</Label>
                    <Textarea
                      value={content.program_text || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "program_text",
                          e.target.value,
                        )
                      }
                      className="min-h-[72px]"
                      placeholder="Descripción del programa de actos..."
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Main Media (Featured & Poster) */}
          <div className="grid gap-6 md:grid-cols-2 mt-4">
            {/* Featured Media */}
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Imagen Principal
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Banner o destacada
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFeaturedMediaSelectorOpen(true)}
                >
                  Seleccionar
                </Button>
              </div>
              {form.featured_media_id &&
                images.find((img) => img.id === form.featured_media_id) && (
                  <div className="flex items-center gap-3 rounded-md bg-background/60 p-2">
                    <img
                      src={
                        images.find((img) => img.id === form.featured_media_id)
                          ?.thumbnail_url ||
                        images.find((img) => img.id === form.featured_media_id)
                          ?.variant_thumbnail ||
                        images.find((img) => img.id === form.featured_media_id)
                          ?.file
                      }
                      alt="Featured media"
                      className="h-10 w-10 rounded object-cover ring-1 ring-border"
                    />
                    <p className="text-xs text-foreground truncate max-w-[150px]">
                      {
                        images.find((img) => img.id === form.featured_media_id)
                          ?.original_name
                      }
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-rose-600 h-8 px-2"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          featured_media_id: null,
                        }))
                      }
                    >
                      X
                    </Button>
                  </div>
                )}
            </div>

            {/* Poster */}
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Cartel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cartel oficial
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPosterSelectorOpen(true)}
                >
                  Seleccionar
                </Button>
              </div>
              {selectedPosters.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {selectedPosters.map((img: MediaItem) => (
                    <div
                      key={img.id}
                      className="relative group rounded-md overflow-hidden aspect-[1/1.414] border shadow-sm"
                    >
                      <img
                        src={
                          img.thumbnail_url || img.variant_thumbnail || img.file
                        }
                        alt="Poster page"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 rounded-full px-3 text-xs"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              poster_ids: (prev.poster_ids || []).filter(
                                (id) => id !== img.id,
                              ),
                            }))
                          }
                        >
                          Quitar
                        </Button>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-white truncate">
                        {img.original_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Program PDF */}
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Programa PDF
                </p>
                <p className="text-xs text-muted-foreground">
                  Documento descargable
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  ref={docInputRef}
                  onChange={handleUploadDoc}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => docInputRef.current?.click()}
                >
                  Subir PDF
                </Button>
              </div>
            </div>
            <select
              value={form.program_pdf_id ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  program_pdf_id: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Sin documento PDF...</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.original_name}
                </option>
              ))}
            </select>
            {form.program_pdf_id &&
              documents.find((doc) => doc.id === form.program_pdf_id) && (
                <div className="flex items-center justify-between rounded-md bg-background/60 px-2 py-1 text-sm">
                  <span>
                    {
                      documents.find((doc) => doc.id === form.program_pdf_id)
                        ?.original_name
                    }
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 h-8 px-2"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, program_pdf_id: null }))
                    }
                  >
                    Quitar
                  </Button>
                </div>
              )}
          </div>

          {/* Gallery Images */}
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Galería de Imágenes
                </p>
                <p className="text-xs text-muted-foreground">
                  Fotos generales de la festa
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsGallerySelectorOpen(true)}
              >
                Añadir Imagen
              </Button>
            </div>

            {selectedGallery.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {selectedGallery.map((img: MediaItem) => (
                  <div
                    key={img.id}
                    className="relative group rounded-md overflow-hidden aspect-square border ring-1 ring-border"
                  >
                    <img
                      src={
                        img.thumbnail_url || img.variant_thumbnail || img.file
                      }
                      alt="Gallery image"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            gallery_ids: (prev.gallery_ids || []).filter(
                              (id) => id !== img.id,
                            ),
                          }))
                        }
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Events */}
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Eventos de la Festa
                </p>
                <p className="text-xs text-muted-foreground">
                  Eventos ordenados de la agenda vinculados
                </p>
              </div>
            </div>

            {/* Selector */}
            <div className="flex gap-2 items-center mt-2">
              <select
                className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val && !(form.event_ids || []).includes(val)) {
                    setForm((prev) => ({
                      ...prev,
                      event_ids: [...(prev.event_ids || []), val],
                    }));
                  }
                  e.target.value = "";
                }}
                value=""
              >
                <option value="" disabled>
                  Selecciona un evento para añadir...
                </option>
                {allEvents
                  .filter((e) => !(form.event_ids || []).includes(e.id))
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}{" "}
                      {e.start_at
                        ? `(${new Date(e.start_at).toLocaleDateString("es-ES")})`
                        : "(Sin fecha)"}
                    </option>
                  ))}
              </select>
            </div>

            {/* List */}
            {selectedEvents.length > 0 && (
              <div className="space-y-2 mt-3">
                {selectedEvents.map((evt, idx) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between bg-background border px-3 py-2 rounded-md shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{evt.title}</span>
                      <span className="text-xs text-muted-foreground">
                        Posición: {idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={idx === 0}
                        onClick={() => handleMoveEvent(idx, "up")}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={idx === selectedEvents.length - 1}
                        onClick={() => handleMoveEvent(idx, "down")}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            event_ids: (prev.event_ids || []).filter(
                              (id) => id !== evt.id,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modals for Image Selectors */}
          <ImageSelector
            open={isFeaturedMediaSelectorOpen}
            onOpenChange={setIsFeaturedMediaSelectorOpen}
            onSelect={(item) => {
              setImages((prev) =>
                prev.some((i) => i.id === item.id) ? prev : [item, ...prev],
              );
              setForm((prev) => ({ ...prev, featured_media_id: item.id }));
            }}
          />
          <ImageSelector
            open={isPosterSelectorOpen}
            onOpenChange={setIsPosterSelectorOpen}
            onSelect={(item) => {
              setImages((prev) =>
                prev.some((i) => i.id === item.id) ? prev : [item, ...prev],
              );
              setForm((prev) => ({
                ...prev,
                poster_ids: [
                  ...(prev.poster_ids || []).filter((id) => id !== item.id),
                  item.id,
                ],
              }));
            }}
          />
          <ImageSelector
            open={isGallerySelectorOpen}
            onOpenChange={setIsGallerySelectorOpen}
            onSelect={(item) => {
              setImages((prev) =>
                prev.some((i) => i.id === item.id) ? prev : [item, ...prev],
              );
              setForm((prev) => ({
                ...prev,
                gallery_ids: [
                  ...(prev.gallery_ids || []).filter((id) => id !== item.id),
                  item.id,
                ],
              }));
            }}
          />

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="submit">
              {festa ? "Guardar cambios" : "Crear festa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
