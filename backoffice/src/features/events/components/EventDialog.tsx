import { useEffect, useMemo, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Languages,
  Loader2,
  X,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  Image as ImageIcon,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MultiSelectHint } from "@/components/common/MultiSelectHint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CreateEventDTO, Event, EventDate } from "../types";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { tagsApi } from "@/features/tags/api/tags";
import { eventsApi } from "../api/events";
import { Category } from "@/features/categories/types";
import { Tag } from "@/features/tags/types";
import { MediaItem } from "@/features/media/types";
import { LANGUAGES } from "@/lib/config/constants";
import { llmApi } from "../api/llm";
import { TranslationDialog } from "./TranslationDialog";
import { cn } from "@/lib/utils";

type LocalTranslations = {
  [lang: string]: { title: string; summary?: string; description?: string };
};

const emptyForm: CreateEventDTO = {
  title: "",
  summary: "",
  description: "",
  is_published: true,
  venue_name: "",
  location_text: "",
  is_featured: false,
  is_free: true,
  price: null,
  price_text: "",
  category_id: null,
  featured_media_id: null,
  attachments_ids: [],
  tag_ids: [],
  translations: {},
  dates: [],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEventDTO) => void;
  event?: Event;
};

export function EventDialog({ open, onOpenChange, onSubmit, event }: Props) {
  const [form, setForm] = useState<CreateEventDTO>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [activeTab, setActiveTab] = useState("content");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [translating, setTranslating] = useState(false);

  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [dates, setDates] = useState<EventDate[]>([]);
  const [newDateStart, setNewDateStart] = useState("");
  const [newDateEnd, setNewDateEnd] = useState("");

  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        summary: event.summary || "",
        description: event.description || "",
        is_published: event.is_published,
        venue_name: event.venue_name || "",
        location_text: event.location_text || "",
        is_featured: !!event.is_featured,
        is_free: event.is_free ?? true,
        price: event.price ?? null,
        price_text: event.price_text || "",
        category_id: event.category ?? null,
        featured_media_id: event.featured_media?.id ?? null,
        attachments_ids: (event.attachments || []).map((a) => a.id),
        tag_ids: (event.tags || []).map((t) => t.id),
      });
      setTranslations(event.translations || {});
      setDates(event.dates || []);
    } else {
      setForm(emptyForm);
      setTranslations({});
      setDates([]);
      setActiveLang("ca");
    }
  }, [event?.id, open]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs, cats, tagsList] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          categoriesApi.list({ taxonomy: "events" }),
          tagsApi.list(),
        ]);
        setImages(imgs);
        setDocuments(docs);
        setCategories(cats);
        setTags(tagsList);
      } catch (err) {
        console.error("Error cargando opciones", err);
        toast.error("No se pudieron cargar las opciones del formulario");
      }
    };
    if (open) loadOptions();
  }, [open]);

  const selectedTagIds = form.tag_ids ?? [];
  const selectedTags = useMemo(() => {
    const selected = new Set(selectedTagIds);
    return tags.filter((tag) => selected.has(tag.id));
  }, [selectedTagIds, tags]);

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) =>
      (a.nombre || a.slug).localeCompare(b.nombre || b.slug, undefined, {
        sensitivity: "base",
      }),
    );
  }, [tags]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return {
        title: form.title,
        summary: form.summary,
        description: form.description,
      };
    }
    const trans = translations[lang] || {
      title: "",
      summary: "",
      description: "",
    };
    // Ensure properties exist to avoid undefined in inputs
    return {
      title: trans.title || "",
      summary: trans.summary || "",
      description: trans.description || "",
    };
  };

  const updateTranslatedField = (
    lang: string,
    field: "title" | "summary" | "description",
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

  const handleAutoTranslate = async (targetLang: string) => {
    if (!event) return;
    if (!form.title) {
      toast.error("No hay títol en el idioma base para traducir");
      return;
    }

    setTranslating(true);
    try {
      const response = await llmApi.autoTranslateEvent(String(event.id), {
        title: form.title,
        summary: form.summary,
        description: form.description,
      });
      if (response.success && response.translations[targetLang]) {
        setTranslations((prev) => ({
          ...prev,
          [targetLang]: {
            ...(prev[targetLang] || {}),
            ...response.translations[targetLang],
          },
        }));
        toast.success(`Traducido a ${targetLang.toUpperCase()}`);
      } else {
        toast.error("Error al traducir", {
          description: response.errors?.[targetLang] || "Error desconocido",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con el servicio de traducción");
    } finally {
      setTranslating(false);
    }
  };

  const handleAddDate = () => {
    if (!newDateStart) {
      toast.error("La fecha de inicio es obligatoria");
      return;
    }

    const start = new Date(newDateStart);
    const end = newDateEnd ? new Date(newDateEnd) : null;

    if (end && end < start) {
      toast.error("La fecha de fin no puede ser anterior al inicio");
      return;
    }

    const newDate: EventDate = {
      start_at: start.toISOString(),
      end_at: end ? end.toISOString() : null,
    };

    setDates((prev) =>
      [...prev, newDate].sort(
        (a, b) =>
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
      ),
    );

    // UX: Suggest next day same time
    const nextDay = new Date(start.getTime() + 86400000);
    const offset = nextDay.getTimezoneOffset();
    const adjustedStart = new Date(nextDay.getTime() - offset * 60 * 1000);
    setNewDateStart(adjustedStart.toISOString().slice(0, 16));

    if (end) {
      const nextEnd = new Date(end.getTime() + 86400000);
      const adjustedEnd = new Date(nextEnd.getTime() - offset * 60 * 1000);
      setNewDateEnd(adjustedEnd.toISOString().slice(0, 16));
    }

    toast.success("Sesión añadida", { duration: 1500 });
  };

  const handleClearDates = () => {
    if (confirm("¿Estás seguro de que quieres borrar TODAS las fechas?")) {
      setDates([]);
    }
  };

  const handleNewDateStartChange = (val: string) => {
    setNewDateStart(val);
    if (val && !newDateEnd) {
      // Suggest end date +1 hour
      const start = new Date(val);
      const end = new Date(start.getTime() + 3600000);
      // Format back to datetime-local string
      const offset = end.getTimezoneOffset();
      const adjusted = new Date(end.getTime() - offset * 60 * 1000);
      setNewDateEnd(adjusted.toISOString().slice(0, 16));
    }
  };

  const handleRemoveDate = (index: number) => {
    setDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (dates.length === 0) {
      toast.error("Debes añadir al menos una fecha al evento");
      setActiveTab("recurrence");
      return;
    }

    const translationsPayload: LocalTranslations = { ...translations };
    delete translationsPayload["ca"];

    onSubmit({
      ...form,
      price_text: form.is_free ? "" : form.price_text,
      attachments_ids: form.attachments_ids ?? [],
      tag_ids: form.tag_ids ?? [],
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
      dates: dates,
    });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await mediaApi.upload(file);
      if (uploaded.type === "image") {
        setImages((prev) => [uploaded, ...prev]);
        setForm((prev) => ({ ...prev, featured_media_id: uploaded.id }));
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir la imagen");
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await mediaApi.upload(file);
      setDocuments((prev) => [uploaded, ...prev]);
      setForm((prev) => ({
        ...prev,
        attachments_ids: Array.from(
          new Set([...(prev.attachments_ids ?? []), uploaded.id]),
        ),
      }));
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir the document");
    } finally {
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === form.category_id),
    [categories, form.category_id],
  );

  const selectedAttachments = useMemo(
    () => documents.filter((doc) => form.attachments_ids?.includes(doc.id)),
    [documents, form.attachments_ids],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6">
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Nuevo evento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="content"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="recurrence">
                Fechas y Horarios {dates.length > 0 && `(${dates.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="venue_name">Lugar / Organizador</Label>
                  <Input
                    id="venue_name"
                    value={form.venue_name || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        venue_name: e.target.value,
                      }))
                    }
                    placeholder="Nombre del lugar o entidad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_text">Ubicación</Label>
                  <Input
                    id="location_text"
                    value={form.location_text || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location_text: e.target.value,
                      }))
                    }
                    placeholder="Descripción o dirección"
                  />
                </div>
              </div>

              {dates.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 text-xs border border-primary/10 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-1 font-bold text-primary-700 dark:text-primary-400 w-full mb-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Próximas sesiones ({dates.length}):</span>
                  </div>
                  {dates.slice(0, 3).map((d, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-white/50 dark:bg-black/20"
                    >
                      {formatDateTime(d.start_at)}
                    </Badge>
                  ))}
                  {dates.length > 3 && (
                    <span className="text-muted-foreground self-center">
                      ... y {dates.length - 3} más
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 ml-auto text-xs"
                    onClick={() => setActiveTab("recurrence")}
                  >
                    Gestionar fechas
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 text-sm border border-amber-200 bg-amber-50 text-amber-800 rounded-lg dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    Este evento no tiene fechas asignadas. Ve a la pestaña{" "}
                    <b>Fechas y Horarios</b> para añadir sesiones.
                  </span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoría</Label>
                  <Select
                    value={form.category_id ? String(form.category_id) : ""}
                    onValueChange={(val: string) =>
                      setForm((prev) => ({
                        ...prev,
                        category_id: val ? Number(val) : null,
                      }))
                    }
                  >
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder="Selecciona una categoría">
                        {selectedCategory?.nombre}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Por defecto</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag_ids">Etiquetas</Label>
                  <MultiSelectHint />
                  <select
                    id="tag_ids"
                    multiple
                    value={(form.tag_ids ?? []).map(String)}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions).map(
                        (opt) => Number(opt.value),
                      );
                      setForm((prev) => ({ ...prev, tag_ids: values }));
                    }}
                    className="h-24 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {sortedTags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.nombre} ({tag.slug})
                      </option>
                    ))}
                  </select>

                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="border-primary/20 bg-primary/10 text-primary"
                        >
                          <span>{tag.nombre}</span>
                          <button
                            type="button"
                            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-primary/15"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                tag_ids: (prev.tag_ids ?? []).filter(
                                  (id) => id !== tag.id,
                                ),
                              }))
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3 p-4 border border-border rounded-xl bg-muted/10">
                {/* Publicado */}
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
                      Publicado
                    </span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                    Visible para todos los usuarios en la web.
                  </p>
                </div>

                {/* Destacado */}
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
                      Destacado
                    </span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                    Aparecerá en posiciones prioritarias de la home.
                  </p>
                </div>

                {/* Gratuito */}
                <div className="flex flex-col gap-1.5">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!form.is_free}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          is_free: e.target.checked,
                          price: e.target.checked ? null : prev.price,
                          price_text: e.target.checked ? "" : prev.price_text,
                        }))
                      }
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Gratuito
                    </span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                    Sin coste de entrada. Oculta campos de precio.
                  </p>
                </div>
              </div>

              {!form.is_free && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (€)</Label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.price !== null ? form.price : ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          price:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_text">Texto de Precio</Label>
                    <Input
                      id="price_text"
                      value={form.price_text || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          price_text: e.target.value,
                        }))
                      }
                      placeholder="Ej: Taquilla inversa"
                    />
                  </div>
                </div>
              )}

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
                      <div className="flex items-center justify-between">
                        <Label>Título {isBase ? "" : `(${lang.name})`}</Label>
                        {!isBase && event && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleAutoTranslate(lang.code)}
                            disabled={translating || !form.title}
                          >
                            {translating ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Traducir IA"
                            )}
                          </Button>
                        )}
                      </div>
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
                        <Label>Descripción detallada</Label>
                        <RichTextEditor
                          value={content.description || ""}
                          onChange={(value) =>
                            updateTranslatedField(
                              lang.code,
                              "description",
                              value,
                            )
                          }
                        />
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Featured Image Selection */}
                <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary-500" />
                      <p className="text-sm font-bold uppercase tracking-wider text-foreground opacity-80">
                        Imagen destacada
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleUploadImage}
                      className="hidden"
                      accept="image/*"
                    />
                    {!selectedImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] uppercase font-bold"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" /> Subir
                      </Button>
                    )}
                  </div>

                  {selectedImage ? (
                    <div className="group relative rounded-lg overflow-hidden border bg-background aspect-video flex items-center justify-center">
                      <img
                        src={selectedImage.thumbnail_url || selectedImage.file}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          Cambiar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase"
                          onClick={() =>
                            setForm((p) => ({ ...p, featured_media_id: null }))
                          }
                        >
                          Quitar
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 backdrop-blur-sm">
                        <p className="text-[10px] text-white truncate font-medium">
                          {selectedImage.original_name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center py-8 gap-2 cursor-pointer hover:border-primary-300 hover:bg-primary-50/10 transition-all"
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-20" />
                      <p className="text-xs text-muted-foreground">
                        No hay imagen seleccionada
                      </p>
                    </div>
                  )}
                </div>

                {/* Attachments Selection */}
                <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary-500" />
                      <p className="text-sm font-bold uppercase tracking-wider text-foreground opacity-80">
                        Adjuntos
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={docInputRef}
                      onChange={handleUploadDoc}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] uppercase font-bold"
                      onClick={() => docInputRef.current?.click()}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Añadir
                    </Button>
                  </div>

                  <div className="space-y-2 min-h-[100px]">
                    {selectedAttachments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-3 bg-background border p-2 rounded-lg group hover:border-primary-200 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-[11px] font-medium truncate max-w-[150px]">
                            {doc.original_name}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="h-7 w-7 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-rose-50"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              attachments_ids: (p.attachments_ids ?? []).filter(
                                (id) => id !== doc.id,
                              ),
                            }))
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {selectedAttachments.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-30">
                        <FileText className="h-8 w-8" />
                        <p className="text-[11px] font-medium">
                          Sin documentos adjuntos
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recurrence" className="space-y-6 pt-4">
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                  Añadir nueva sesión
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Inicio</Label>
                    <Input
                      type="datetime-local"
                      value={newDateStart}
                      onChange={(e) => handleNewDateStartChange(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddDate())
                      }
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Fin (Opcional)
                    </Label>
                    <Input
                      type="datetime-local"
                      value={newDateEnd}
                      onChange={(e) => setNewDateEnd(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddDate())
                      }
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddDate}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Registrar fecha
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Sesiones programadas ({dates.length})
                  </h4>
                  {dates.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearDates}
                      className="text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Limpiar todo
                    </Button>
                  )}
                </div>

                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                      <TableRow>
                        <TableHead className="font-bold">
                          Fecha y Hora de Inicio
                        </TableHead>
                        <TableHead className="font-bold">Hora de Fin</TableHead>
                        <TableHead className="w-[80px] text-right">
                          Borrar
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dates.map((d, i) => (
                        <TableRow key={i} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-primary-500" />
                              {formatDateTime(d.start_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {d.end_at ? formatDateTime(d.end_at, true) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDate(i)}
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {dates.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <CalendarIcon className="h-8 w-8 opacity-20" />
                              <p>No hay fechas programadas para este evento.</p>
                              <p className="text-xs">
                                Usa el formulario superior para añadir sesiones.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            {event && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setTranslationDialogOpen(true)}
              >
                <Languages className="mr-2 h-4 w-4" /> IA Global
              </Button>
            )}
            <Button type="submit">
              {event ? "Guardar cambios" : "Crear evento"}
            </Button>
          </div>
        </form>

        {event && (
          <TranslationDialog
            open={translationDialogOpen}
            onOpenChange={setTranslationDialogOpen}
            eventId={String(event.id)}
            currentTitle={form.title}
            currentSummary={form.summary || ""}
            currentDescription={form.description || ""}
            onApplyTranslations={(t) => {
              setTranslations((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(t).map(([lang, values]) => [
                    lang,
                    { ...(prev[lang] || {}), ...values },
                  ]),
                ),
              }));
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatDateTime(iso: string, timeOnly = false) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (timeOnly) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toIso(value: string) {
  if (!value) return value;
  return new Date(value).toISOString();
}

function toDatetimeLocal(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().slice(0, 16);
}
