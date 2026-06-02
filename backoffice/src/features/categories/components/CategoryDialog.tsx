import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { LANGUAGES } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_OPTIONS, getCategoryIconSrc } from "../constants/icons";
import { Category, CategoryPayload } from "../types";
import { categoriesApi } from "../api/categories";
import { mediaApi } from "@/features/media/api/media";
import { MediaItem } from "@/features/media/types";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  FileText,
  Upload,
  Plus,
  X,
  Loader2,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CategoryPayload) => Promise<void>;
  category?: Category;
  categories?: Category[];
};

type LocalTranslations = {
  [lang: string]: { nombre: string; descripcion?: string };
};

const emptyForm: CategoryPayload = {
  slug: "",
  taxonomy: "",
  icon: "",
  parent: null,
  nombre: "",
  descripcion: "",
  translations: {},
  is_published: true,
  featured_media_id: null,
  attachments_ids: [],
  seo_title: "",
  seo_description: "",
};

const buildFormFromCategory = (category?: Category): CategoryPayload => {
  if (!category) return emptyForm;
  return {
    slug: category.slug,
    taxonomy: category.taxonomy || "",
    icon: category.icon || "",
    parent: category.parent ?? null,
    nombre: category.nombre,
    descripcion: category.descripcion || "",
    translations: category.translations || {},
    is_published: category.is_published ?? true,
    featured_media_id: category.featured_media_id ?? null,
    attachments_ids: category.attachments_ids ?? [],
    seo_title: category.seo_title || "",
    seo_description: category.seo_description || "",
  };
};

export function CategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  category,
  categories = [],
}: Props) {
  const [form, setForm] = useState<CategoryPayload>(() =>
    buildFormFromCategory(category),
  );
  const [activeLang, setActiveLang] = useState("ca");
  const [activeTab, setActiveTab] = useState("general");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const iconPreviewSrc = getCategoryIconSrc(form.icon);
  const parentOptions = categories.filter(
    (c) => !category || c.id !== category.id,
  );

  useEffect(() => {
    setForm(buildFormFromCategory(category));
    setTranslations(category?.translations || {});
    setActiveTab("general");
    setActiveLang("ca");
  }, [category, open]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
        ]);
        setImages(imgs);
        setDocuments(docs);
      } catch (err) {
        console.error("Error cargando opciones de media", err);
        toast.error("No se pudieron cargar las imágenes y documentos");
      }
    };
    if (open) loadOptions();
  }, [open]);

  const updateField = (
    lang: string,
    field: "nombre" | "descripcion",
    value: string,
  ) => {
    if (lang === "ca") {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setTranslations((prev) => ({
        ...prev,
        [lang]: {
          ...(prev[lang] || {}),
          [field]: value,
        },
      }));
    }
  };

  const handleIconChange = (value: string) => {
    setForm((prev) => ({ ...prev, icon: value }));
  };

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return { nombre: form.nombre, descripcion: form.descripcion };
    }
    return translations[lang] || { nombre: "", descripcion: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    const iconValue = form.icon?.trim() ?? "";
    const payload: CategoryPayload = {
      ...form,
      parent: form.parent ?? null,
      icon: iconValue,
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
      attachments_ids: form.attachments_ids ?? [],
    };
    await onSubmit(payload);
  };

  const handleAutoTranslate = async (targetLang: string) => {
    if (!category) return;
    if (!form.nombre) {
      toast.error("No hay nombre en el idioma base para traducir");
      return;
    }
    setLoadingTranslate(true);
    try {
      const response = await categoriesApi.autoTranslate(category.id, {
        source_lang: "ca",
        target_langs: [targetLang],
      });
      if (response.success && response.translations[targetLang]) {
        const t = response.translations[targetLang];
        setTranslations((prev) => ({ ...prev, [targetLang]: t }));
        toast.success(`Traducido a ${targetLang.toUpperCase()}`);
      } else {
        toast.error("Error al traducir", {
          description: response.errors?.[targetLang] || "Error desconocido",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al traducir categoría");
    } finally {
      setLoadingTranslate(false);
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
      toast.error("No se pudo subir el documento");
    } finally {
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );

  const selectedAttachments = useMemo(
    () => documents.filter((doc) => form.attachments_ids?.includes(doc.id)),
    [documents, form.attachments_ids],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            Gestiona la información general, contenido multilingüe y media.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="general"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 pt-4">
              <div className="flex flex-col gap-1.5 p-4 border border-border rounded-xl bg-muted/10">
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
                  Si está desactivado, la categoría no será visible
                  públicamente.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    required
                    disabled={!!category}
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador único para URLs.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxonomy">Taxonomía</Label>
                  <Select
                    value={form.taxonomy || "none"}
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        taxonomy: val === "none" ? "" : val,
                      }))
                    }
                  >
                    <SelectTrigger id="taxonomy">
                      <SelectValue placeholder="Selecciona taxonomía">
                        {form.taxonomy === "events" && "Eventos"}
                        {form.taxonomy === "places" && "Lugares"}
                        {form.taxonomy === "template" && "Plantilla"}
                        {form.taxonomy === "theme" && "Tema"}
                        {form.taxonomy === "audience" && "Audiencia"}
                        {form.taxonomy === "season" && "Temporada"}
                        {form.taxonomy === "news" && "Noticias"}
                        {form.taxonomy === "other" && "Otro"}
                        {(!form.taxonomy || form.taxonomy === "none") &&
                          "Sin taxonomía"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin taxonomía</SelectItem>
                      <SelectItem value="events">Eventos</SelectItem>
                      <SelectItem value="places">Lugares</SelectItem>
                      <SelectItem value="template">Plantilla</SelectItem>
                      <SelectItem value="theme">Tema</SelectItem>
                      <SelectItem value="audience">Audiencia</SelectItem>
                      <SelectItem value="season">Temporada</SelectItem>
                      <SelectItem value="news">Noticias</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="parent">Categoría padre</Label>
                  <Select
                    value={form.parent ? String(form.parent) : "root"}
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        parent: val === "root" ? null : Number(val),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin padre (Nivel raíz)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">
                        Sin padre (Nivel raíz)
                      </SelectItem>
                      {parentOptions.map((opt) => (
                        <SelectItem key={opt.id} value={String(opt.id)}>
                          {opt.nombre} ({opt.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Define la jerarquía visible en el sitio.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 pt-4">
              <Tabs
                value={activeLang}
                onValueChange={setActiveLang}
                defaultValue="ca"
              >
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
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label htmlFor={`nombre-${lang.code}`}>
                          Nombre {isBase ? "" : `(${lang.name})`}
                        </Label>
                        {!isBase && category && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleAutoTranslate(lang.code)}
                            disabled={loadingTranslate || !form.nombre}
                          >
                            {loadingTranslate ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Traducir IA"
                            )}
                          </Button>
                        )}
                      </div>
                      <Input
                        id={`nombre-${lang.code}`}
                        value={content.nombre || ""}
                        onChange={(e) =>
                          updateField(lang.code, "nombre", e.target.value)
                        }
                        required={isBase}
                        placeholder={
                          isBase ? "" : "Traducción automática o manual"
                        }
                      />
                      <div className="space-y-2">
                        <Label>
                          Descripción {isBase ? "" : `(${lang.name})`}
                        </Label>
                        <RichTextEditor
                          value={content.descripcion || ""}
                          onChange={(value) =>
                            updateField(lang.code, "descripcion", value)
                          }
                        />
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 pt-4">
              {/* Sección Icono */}
              <section className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Icono
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Selecciona un icono oficial de Gaudeix Cabrera para
                      mostrarlo en los listados.
                    </p>
                  </div>
                  {iconPreviewSrc && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/70 bg-background">
                      <img
                        src={iconPreviewSrc}
                        alt=""
                        className="h-6 w-6 object-contain"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORY_ICON_OPTIONS.map((option) => {
                    const isActive = form.icon === option.value;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition",
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/70 hover:border-primary/40",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isActive}
                          onChange={() =>
                            handleIconChange(isActive ? "" : option.value)
                          }
                        />
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background">
                          <img
                            src={option.src}
                            alt=""
                            className="h-5 w-5 object-contain"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="leading-tight">
                          <div className="text-sm font-semibold">
                            {option.labelEs}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-bold">{option.labelCa}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    id="icon"
                    name="icon"
                    value={form.icon || ""}
                    onChange={(e) => handleIconChange(e.target.value)}
                    list="category-icon-suggestions"
                    placeholder="routes, nature, agenda..."
                  />
                  {form.icon && (
                    <div className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-md border border-border/70 bg-background px-2">
                      {iconPreviewSrc ? (
                        <img
                          src={iconPreviewSrc}
                          alt=""
                          className="h-6 w-6 object-contain"
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          ?
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <datalist id="category-icon-suggestions">
                  {CATEGORY_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.labelEs}
                    </option>
                  ))}
                </datalist>
              </section>

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
                        alt="Featured"
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

            <TabsContent value="seo" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">Meta Título</Label>
                  <Input
                    id="seo_title"
                    value={form.seo_title || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seo_title: e.target.value,
                      }))
                    }
                    placeholder="Título para buscadores"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">Meta Descripción</Label>
                  <Textarea
                    id="seo_description"
                    value={form.seo_description || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seo_description: e.target.value,
                      }))
                    }
                    placeholder="Descripción breve para buscadores"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{category ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
