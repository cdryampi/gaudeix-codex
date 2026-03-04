/**
 * Route create/edit dialog component.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ImageIcon,
  Upload,
  X,
  Loader2,
  MapIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { LANGUAGES } from "@/lib/config/constants";
import { CreateRouteDTO, DifficultyLevel, Route, RouteType } from "../types";
import { routesApi } from "../api/routes";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { tagsApi } from "@/features/tags/api/tags";
import { MediaItem } from "@/features/media/types";
import { Category } from "@/features/categories/types";
import { Tag } from "@/features/tags/types";
import { placesApi } from "@/features/places/api/places";
import { Place } from "@/features/places/types";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { RoutePointsEditor } from "./RoutePointsEditor";

type LocalTranslations = {
  [lang: string]: {
    title: string;
    summary?: string;
    description?: string;
    instructions?: string;
  };
};

const ROUTE_TYPES = [
  { value: "walking", label: "A peu" },
  { value: "cycling", label: "Bicicleta" },
  { value: "guided", label: "Guiada" },
  { value: "mixed", label: "Mixta" },
] as const;

const DIFFICULTIES = [
  { value: "easy", label: "Fàcil" },
  { value: "moderate", label: "Moderada" },
  { value: "difficult", label: "Difícil" },
  { value: "expert", label: "Expert" },
] as const;

const emptyForm: CreateRouteDTO = {
  title: "",
  summary: "",
  description: "",
  instructions: "",
  route_type: "walking",
  difficulty: "moderate",
  distance_km: undefined,
  duration_minutes: undefined,
  elevation_gain: undefined,
  elevation_loss: undefined,
  is_circular: false,
  is_published: false,
  is_featured: false,
  ios_app_url: "",
  android_app_url: "",
  translations: {},
  tag_ids: [],
  attachments_ids: [],
  gallery_ids: [],
  category_id: null,
  featured_media_id: null,
  gpx_file_id: null,
  waypoints_input: [],
  checkpoints_input: [],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRouteDTO) => void;
  onRouteGenerated?: (route: Route) => void;
  route?: Route;
};

export function RouteDialog({
  open,
  onOpenChange,
  onSubmit,
  onRouteGenerated,
  route,
}: Props) {
  const [activeTab, setActiveTab] = useState("content");
  const [form, setForm] = useState<CreateRouteDTO>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [translating, setTranslating] = useState(false);
  const [generatingGpx, setGeneratingGpx] = useState(false);

  // External options
  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const attachmentsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs, cats, tagsList, placesList] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          categoriesApi.list(),
          tagsApi.list(),
          placesApi.getAll(),
        ]);
        setImages(imgs);
        setDocuments(docs);
        setCategories(cats);
        setTags(tagsList);
        setPlaces(placesList);
      } catch (err) {
        console.error("Error cargando opciones", err);
        toast.error("No se pudieron cargar opciones.");
      }
    };
    if (open) loadOptions();
  }, [open]);

  useEffect(() => {
    if (route) {
      setForm({
        title: route.title,
        summary: route.summary || "",
        description: route.description || "",
        instructions: route.instructions || "",
        route_type: route.route_type,
        difficulty: route.difficulty,
        distance_km: route.distance_km,
        duration_minutes: route.duration_minutes,
        elevation_gain: route.elevation_gain,
        elevation_loss: route.elevation_loss,
        start_latitude: route.start_latitude,
        start_longitude: route.start_longitude,
        end_latitude: route.end_latitude,
        end_longitude: route.end_longitude,
        is_circular: route.is_circular,
        is_published: route.is_published,
        is_featured: route.is_featured,
        ios_app_url: route.ios_app_url || "",
        android_app_url: route.android_app_url || "",
        category_id: route.category ?? null,
        featured_media_id: route.featured_media?.id ?? null,
        gpx_file_id: route.gpx_file?.id ?? null,
        tag_ids: (route.tags || []).map((t) => t.id),
        attachments_ids: (route.attachments || []).map((a) => a.id),
        gallery_ids: (route.gallery || []).map((a) => a.id),
        waypoints_input: (route.waypoints_list || []).map((wp) => ({
          place_id: wp.place_id,
          order: wp.order,
          instructions: wp.instructions || "",
          distance_from_previous_km: wp.distance_from_previous_km ?? null,
        })),
        checkpoints_input: (route.checkpoints_list || []).map((cp) => ({
          order: cp.order,
          title: cp.title,
          description: cp.description || "",
          latitude: cp.lat ?? null,
          longitude: cp.lng ?? null,
          is_active: cp.is_active,
        })),
      });
      setTranslations(route.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
      setActiveTab("content");
    }
  }, [route, open]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return {
        title: form.title,
        summary: form.summary,
        description: form.description,
        instructions: form.instructions,
      };
    }
    const trans = translations[lang] || {
      title: "",
      summary: "",
      description: "",
      instructions: "",
    };
    return {
      title: trans.title || "",
      summary: trans.summary || "",
      description: trans.description || "",
      instructions: trans.instructions || "",
    };
  };

  const updateTranslatedField = (
    lang: string,
    field: "title" | "summary" | "description" | "instructions",
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
    if (!route) return;
    setTranslating(true);
    try {
      const updatedRoute = await routesApi.autoTranslate(route.slug);
      if (updatedRoute.translations && updatedRoute.translations[targetLang]) {
        setTranslations((prev) => ({
          ...prev,
          [targetLang]: updatedRoute.translations![targetLang],
        }));
        toast.success(`Traducido a ${targetLang.toUpperCase()} con IA`);
      } else {
        toast.error("La traducción se completó pero no se devolvió texto para este idioma.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al traducir usando la IA");
    } finally {
      setTranslating(false);
    }
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
    } catch {
      toast.error("No se pudo subir la imagen");
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleGenerateGpx = async () => {
    if (!route) return;
    setGeneratingGpx(true);
    try {
      const updated = await routesApi.generateGpx(route.slug);
      const newGpxFile = updated.gpx_file;
      if (newGpxFile) {
        // Add the newly created DocumentFile to the local documents list
        // so selectedGpx (which searches this array) can find it
        setDocuments((prev) => {
          const alreadyExists = prev.some((d) => d.id === newGpxFile.id);
          if (alreadyExists) return prev;
          return [{ ...newGpxFile, type: "document" as const }, ...prev];
        });
        setForm((prev) => ({ ...prev, gpx_file_id: newGpxFile.id }));
        toast.success("GPX generado y guardado correctamente");
        onRouteGenerated?.(updated);
      } else {
        toast.error("El backend no devolvió el archivo GPX generado");
      }
    } catch (err) {
      console.error("[GPX] Error generando GPX:", err);
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "No se pudo generar el GPX desde los puntos de la ruta";
      toast.error(message);
    } finally {
      setGeneratingGpx(false);
    }
  };

  const handleUploadGpx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await mediaApi.upload(file);
      setDocuments((prev) => [uploaded, ...prev]);
      setForm((prev) => ({ ...prev, gpx_file_id: uploaded.id }));
      toast.success("Archivo GPX subido correctamente");
    } catch {
      toast.error("No se pudo subir el archivo GPX");
    } finally {
      if (gpxInputRef.current) gpxInputRef.current.value = "";
    }
  };

  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      for (const file of files) {
        const uploaded = await mediaApi.upload(file);
        if (uploaded.type === "image") {
          setImages((prev) => [uploaded, ...prev]);
          setForm((prev) => ({
            ...prev,
            gallery_ids: [...(prev.gallery_ids || []), uploaded.id],
          }));
        }
      }
      toast.success("Imágenes subidas a la galería");
    } catch {
      toast.error("No se pudieron subir las imágenes");
    } finally {
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      for (const file of files) {
        const uploaded = await mediaApi.upload(file);
        setDocuments((prev) => [uploaded, ...prev]);
        setForm((prev) => ({
          ...prev,
          attachments_ids: [...(prev.attachments_ids || []), uploaded.id],
        }));
      }
      toast.success("Archivo adjunto subido correctamente");
    } catch {
      toast.error("No se pudo subir el archivo adjunto");
    } finally {
      if (attachmentsInputRef.current) attachmentsInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: At least 1 point with coordinates or a GPX file
    const hasGpx = !!form.gpx_file_id;
    const hasStartEnd = !!form.start_latitude && !!form.start_longitude;
    const hasWaypoints = (form.waypoints_input || []).some(
      (wp) => places.find((p) => p.id === wp.place_id)?.latitude
    );
    const hasCheckpoints = (form.checkpoints_input || []).some(
      (cp) => !!cp.latitude && !!cp.longitude
    );

    if (!hasGpx && !hasStartEnd && !hasWaypoints && !hasCheckpoints) {
      toast.error("La ruta debe tener al menos una coordenada o un archivo GPX.");
      return;
    }

    const translationsPayload: LocalTranslations = { ...translations };
    delete translationsPayload["ca"];

    onSubmit({
      ...form,
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    });
  };

  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );

  const selectedGpx = useMemo(
    () => documents.find((doc) => doc.id === form.gpx_file_id),
    [documents, form.gpx_file_id],
  );

  const selectedGallery = useMemo(() => {
    const ids = new Set(form.gallery_ids || []);
    return images.filter((img) => ids.has(img.id));
  }, [images, form.gallery_ids]);

  const selectedAttachments = useMemo(() => {
    const ids = new Set(form.attachments_ids || []);
    return documents.filter((doc) => ids.has(doc.id));
  }, [documents, form.attachments_ids]);

  const selectedTags = useMemo(() => {
    const selected = new Set(form.tag_ids || []);
    return tags.filter((tag) => selected.has(tag.id));
  }, [form.tag_ids, tags]);

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) =>
      (a.nombre || a.slug).localeCompare(b.nombre || b.slug, undefined, {
        sensitivity: "base",
      }),
    );
  }, [tags]);

  // Editorial Checklist
  const checklist = useMemo(() => {
    const items = [];
    if (!form.featured_media_id)
      items.push({ label: "Falta imagen destacada", type: "warning" });
    if (!form.category_id)
      items.push({ label: "Sin categoría asignada", type: "warning" });
    if (!form.gpx_file_id)
      items.push({ label: "No tiene archivo GPX asignado", type: "info" });
    if ((form.summary?.length || 0) < 20)
      items.push({ label: "Resumen muy corto", type: "info" });
    if (!form.distance_km || !form.duration_minutes)
      items.push({ label: "Faltan datos de distancia o duración", type: "warning" });

    return items;
  }, [form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{route ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
        </DialogHeader>
        <form
          key={open ? `route-${route?.id || "new"}` : "closed"}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="technical">Datos Técnicos</TabsTrigger>
              <TabsTrigger value="media">Media & Extras</TabsTrigger>
              <TabsTrigger value="waypoints">Puntos de Ruta</TabsTrigger>
            </TabsList>

            {/* TAB: CONTENT */}
            <TabsContent value="content" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoría</Label>
                  <Select
                    value={form.category_id ? String(form.category_id) : "none"}
                    onValueChange={(val: string) =>
                      setForm((prev) => ({
                        ...prev,
                        category_id: val === "none" ? null : Number(val),
                      }))
                    }
                  >
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Por defecto</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de ruta</Label>
                  <Select
                    key={form.route_type}
                    value={form.route_type || "walking"}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, route_type: val as RouteType }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de ruta" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUTE_TYPES.map((rt) => (
                        <SelectItem key={rt.value} value={rt.value}>
                          {rt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles Status */}
              <div className="grid gap-6 md:grid-cols-3 p-4 border border-border rounded-xl bg-muted/10">
                <div className="flex flex-col gap-1.5">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!form.is_published}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, is_published: e.target.checked }))
                      }
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Publicada
                    </span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                    Visible en la plataforma.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!form.is_featured}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                      }
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Destacada
                    </span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                    Alta prioridad visual.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!form.is_circular}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, is_circular: e.target.checked }))
                      }
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Circular
                    </span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                    Empieza y acaba en el mismo punto.
                  </p>
                </div>
              </div>

              {/* Translations Tab */}
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
                        {!isBase && route && (
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
                          updateTranslatedField(lang.code, "title", e.target.value)
                        }
                        required={isBase}
                      />

                      <div className="space-y-2">
                        <Label>Resumen breve</Label>
                        <Textarea
                          value={content.summary || ""}
                          onChange={(e) =>
                            updateTranslatedField(lang.code, "summary", e.target.value)
                          }
                          className="min-h-[72px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Descripción detallada</Label>
                        <RichTextEditor
                          value={content.description || ""}
                          onChange={(value) =>
                            updateTranslatedField(lang.code, "description", value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Instrucciones de ruta</Label>
                        <RichTextEditor
                          value={content.instructions || ""}
                          onChange={(value) =>
                            updateTranslatedField(lang.code, "instructions", value)
                          }
                        />
                      </div>

                      {/* Calidad Editorial via Checklist */}
                      {checklist.length > 0 && (
                        <div className="mt-8 p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Calidad Editorial
                          </p>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {checklist.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs font-medium text-amber-700/80"
                              >
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    item.type === "error"
                                      ? "bg-rose-500"
                                      : "bg-amber-400",
                                  )}
                                />
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </TabsContent>

            {/* TAB: TECHNICAL */}
            <TabsContent value="technical" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Distancia (km)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.distance_km ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        distance_km: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración (min)</Label>
                  <Input
                    type="number"
                    value={form.duration_minutes ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        duration_minutes: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desnivel + (m)</Label>
                  <Input
                    type="number"
                    value={form.elevation_gain ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        elevation_gain: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desnivel - (m)</Label>
                  <Input
                    type="number"
                    value={form.elevation_loss ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        elevation_loss: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Dificultad</Label>
                  <Select
                    key={form.difficulty}
                    value={form.difficulty || "moderate"}
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        difficulty: val as DifficultyLevel,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag_ids">Etiquetas y Marcas</Label>
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

              {/* Coordenadas Geográficas */}
              <div className="grid gap-4 md:grid-cols-4 p-4 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                <h3 className="col-span-full text-sm font-semibold text-slate-800 dark:text-slate-300">
                  Coordenadas GPS (Opcional)
                </h3>
                <div className="space-y-2">
                  <Label>Latitud Inicio</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="41.385063"
                    value={form.start_latitude ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        start_latitude: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitud Inicio</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="2.173404"
                    value={form.start_longitude ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        start_longitude: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Latitud Fin</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="41.385063"
                    value={form.end_latitude ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        end_latitude: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitud Fin</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="2.173404"
                    value={form.end_longitude ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        end_longitude: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              {/* App Integrations */}
              <div className="grid gap-4 md:grid-cols-2 p-4 border border-border rounded-xl bg-orange-50/50 dark:bg-orange-950/20">
                <h3 className="col-span-full text-sm font-semibold text-orange-800 dark:text-orange-300">
                  Integración App Guiada (Natura Local)
                </h3>
                <div className="space-y-2">
                  <Label>Enlace iOS (App Store)</Label>
                  <Input
                    type="url"
                    placeholder="https://apps.apple.com/..."
                    value={form.ios_app_url ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ios_app_url: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Enlace Android (Google Play)</Label>
                  <Input
                    type="url"
                    placeholder="https://play.google.com/..."
                    value={form.android_app_url ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        android_app_url: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB: MEDIA & EXTRAS */}
            <TabsContent value="media" className="space-y-4 pt-4">
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
                          onClick={() => setForm(prev => ({ ...prev, featured_media_id: null }))}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground gap-2 bg-background/50">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                      <span className="text-xs font-medium">Sin imagen asignada</span>
                    </div>
                  )}
                </div>

                {/* GPX File Selection */}
                <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapIcon className="h-4 w-4 text-primary-500" />
                      <p className="text-sm font-bold uppercase tracking-wider text-foreground opacity-80">
                        Archivo GPX
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={gpxInputRef}
                      onChange={handleUploadGpx}
                      className="hidden"
                      accept=".gpx,application/gpx+xml"
                    />
                    <div className="flex items-center gap-2">
                      {route && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] uppercase font-bold border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                          onClick={handleGenerateGpx}
                          disabled={generatingGpx}
                        >
                          {generatingGpx ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <MapIcon className="mr-1.5 h-3.5 w-3.5" />
                              Generar
                            </>
                          )}
                        </Button>
                      )}
                      {!selectedGpx && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] uppercase font-bold"
                          onClick={() => gpxInputRef.current?.click()}
                        >
                          <Upload className="mr-1.5 h-3.5 w-3.5" /> Subir
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedGpx ? (
                    <div className="group relative rounded-lg overflow-hidden border bg-background h-24 flex items-center justify-center flex-col px-4 text-center">
                      <span className="font-medium text-sm text-primary break-all">{selectedGpx.file?.split('/').pop() || "Archivo GPX"}</span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase"
                          onClick={() => gpxInputRef.current?.click()}
                        >
                          Cambiar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase"
                          onClick={() => setForm(prev => ({ ...prev, gpx_file_id: null }))}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground gap-2 bg-background/50">
                      <MapIcon className="h-6 w-6 opacity-20" />
                      <span className="text-xs font-medium">Sin archivo GPX</span>
                    </div>
                  )}
                </div>

                {/* Gallery Selection */}
                <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm md:col-span-2 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary-500" />
                      <p className="text-sm font-bold uppercase tracking-wider text-foreground opacity-80">
                        Galería de Imágenes
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      ref={galleryInputRef}
                      onChange={handleUploadGallery}
                      className="hidden"
                      accept="image/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] uppercase font-bold"
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" /> Añadir a Galería
                    </Button>
                  </div>

                  {selectedGallery.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedGallery.map((img) => (
                        <div key={img.id} className="group relative rounded-lg overflow-hidden border bg-background aspect-square flex items-center justify-center">
                          <img
                            src={img.thumbnail_url || img.file}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 text-[10px] font-bold uppercase"
                              onClick={() => setForm(prev => ({ ...prev, gallery_ids: (prev.gallery_ids || []).filter(id => id !== img.id) }))}
                            >
                              <X className="h-3 w-3 mr-1" /> Quitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground gap-2 bg-background/50">
                      <span className="text-xs font-medium">No hay imágenes en la galería</span>
                    </div>
                  )}
                </div>

                {/* Attachments Selection */}
                <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm md:col-span-2 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary-500" />
                      <p className="text-sm font-bold uppercase tracking-wider text-foreground opacity-80">
                        Archivos de Descarga Adicional (PDF, etc)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      ref={attachmentsInputRef}
                      onChange={handleUploadAttachment}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] uppercase font-bold"
                      onClick={() => attachmentsInputRef.current?.click()}
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" /> Adjuntar PDF
                    </Button>
                  </div>

                  {selectedAttachments.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedAttachments.map((doc) => (
                        <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg border bg-background">
                          <span className="font-medium text-sm text-primary break-all">{doc.file?.split('/').pop() || "Documento"}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setForm(prev => ({ ...prev, attachments_ids: (prev.attachments_ids || []).filter(id => id !== doc.id) }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground gap-2 bg-background/50">
                      <span className="text-xs font-medium">Ningún pdf o archivo añadido</span>
                    </div>
                  )}
                </div>

              </div>
            </TabsContent>

            {/* TAB: WAYPOINTS */}
            <TabsContent value="waypoints" className="space-y-4 pt-4">
              <RoutePointsEditor
                form={form}
                setForm={setForm}
                places={places}
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="submit">
              {route ? "Guardar cambios" : "Crear ruta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
