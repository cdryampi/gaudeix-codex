/**
 * NewsDialog - Create/Edit dialog for news articles
 */
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
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { X, Image as ImageIcon, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateNewsDTO, News } from "../types";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";
import { MediaItem } from "@/features/media/types";
import { LANGUAGES } from "@/lib/config/constants";

type LocalTranslations = {
  [lang: string]: { title: string; excerpt?: string; content?: string };
};

const emptyForm: CreateNewsDTO = {
  title: "",
  excerpt: "",
  content: "",
  is_published: true,
  publish_date: null,
  category_id: null,
  featured_media_id: null,
  attachments_ids: [],
  translations: {},
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateNewsDTO) => void;
  news?: News;
};

export function NewsDialog({ open, onOpenChange, onSubmit, news }: Props) {
  const [form, setForm] = useState<CreateNewsDTO>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});

  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (news) {
      setForm({
        title: news.title,
        excerpt: news.excerpt || "",
        content: news.content || "",
        is_published: news.is_published,
        publish_date: news.publish_date || null,
        category_id: news.category ?? null,
        featured_media_id: news.featured_media?.id ?? null,
        attachments_ids: (news.attachments || []).map((a) => a.id),
      });
      setTranslations(news.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [news?.id, open]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs, cats] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          categoriesApi.list({ taxonomy: "news" }),
        ]);
        setImages(imgs);
        setDocuments(docs);
        setCategories(cats);
      } catch (err) {
        console.error("Error loading options", err);
        toast.error("No se pudieron cargar las opciones del formulario");
      }
    };
    if (open) loadOptions();
  }, [open]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
      };
    }
    const trans = translations[lang] || {
      title: "",
      excerpt: "",
      content: "",
    };
    return {
      title: trans.title || "",
      excerpt: trans.excerpt || "",
      content: trans.content || "",
    };
  };

  const updateTranslatedField = (
    lang: string,
    field: "title" | "excerpt" | "content",
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

    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    const translationsPayload: LocalTranslations = { ...translations };
    delete translationsPayload["ca"];

    onSubmit({
      ...form,
      attachments_ids: form.attachments_ids ?? [],
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
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
      toast.error("No se pudo subir el documento");
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
          <DialogTitle>{news ? "Editar noticia" : "Nueva noticia"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Settings Row */}
          <div className="grid gap-4 md:grid-cols-3">
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
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publish_date">Fecha publicación</Label>
              <Input
                id="publish_date"
                type="date"
                value={form.publish_date || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    publish_date: e.target.value || null,
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2 pt-7">
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
            </div>
          </div>

          {/* Translation Tabs */}
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
                    <Label>Extracto</Label>
                    <Textarea
                      value={content.excerpt || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "excerpt",
                          e.target.value,
                        )
                      }
                      className="min-h-[72px]"
                      placeholder="Breve resumen de la noticia..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenido</Label>
                    <RichTextEditor
                      value={content.content || ""}
                      onChange={(value) =>
                        updateTranslatedField(lang.code, "content", value)
                      }
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Media Section */}
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
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Añadir
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

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="submit">
              {news ? "Guardar cambios" : "Crear noticia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
