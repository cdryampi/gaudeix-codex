/**
 * StoryDialog - Create/Edit dialog for stories
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
import { X, Image as ImageIcon, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateStoryDTO, Story, StoryTranslation } from "../types";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";
import { MediaItem } from "@/features/media/types";
import { LANGUAGES } from "@/lib/config/constants";

type LocalTranslations = {
  [lang: string]: StoryTranslation;
};

const emptyForm: CreateStoryDTO = {
  title: "",
  summary: "",
  content: "",
  is_published: true,
  historical_period: "Iberian",
  reading_time: 5,
  difficulty: "easy",
  category_id: null,
  featured_media_id: null,
  attachments_ids: [],
  source_url: "",
  source_name: "",
  translations: {},
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStoryDTO) => void;
  story?: Story;
};

export function StoryDialog({ open, onOpenChange, onSubmit, story }: Props) {
  const [form, setForm] = useState<CreateStoryDTO>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});

  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (story) {
      setForm({
        title: story.title,
        summary: story.summary || "",
        content: story.content || "",
        is_published: story.is_published,
        historical_period: story.historical_period || "Iberian",
        reading_time: story.reading_time || 5,
        difficulty: story.difficulty || "easy",
        category_id: story.category_id ?? story.category?.id ?? null,
        featured_media_id: story.featured_media?.id ?? null,
        attachments_ids: (story.attachments || []).map((a) => a.id),
        source_url: story.source_url || "",
        source_name: story.source_name || "",
        audio_file_id: story.audio_file_id ?? story.audio_file?.id ?? null,
        audio_file: story.audio_file || null,
      });
      setTranslations(story.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [story, open]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs, cats] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          categoriesApi.list({ taxonomy: "story_type" }),
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
        summary: form.summary,
        content: form.content,
        audio_file: form.audio_file || null,
        audio_file_id: form.audio_file_id || null,
      };
    }
    const trans = translations[lang] || {
      title: "",
      summary: "",
      content: "",
      audio_file: null,
      audio_file_id: null,
    };
    return {
      title: trans.title || "",
      summary: trans.summary || "",
      content: trans.content || "",
      audio_file: trans.audio_file || null,
      audio_file_id: trans.audio_file_id || null,
    };
  };

  const updateTranslatedField = (
    lang: string,
    field: keyof StoryTranslation,
    value: any,
  ) => {
    if (lang === "ca") {
      if (field === "audio_file") {
        setForm((prev) => ({
          ...prev,
          audio_file: value,
          audio_file_id: value ? Number(value.id) : null,
        }));
      } else {
        setForm((prev) => ({ ...prev, [field]: value }));
      }
      return;
    }
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || {}),
        [field]: value,
        ...(field === "audio_file"
          ? { audio_file_id: value ? Number(value.id) : null }
          : {}),
      } as any,
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

    // Ensure audio_file_id is properly formatted inside translations as well
    Object.keys(translationsPayload).forEach((lang) => {
      const trans = translationsPayload[lang];
      if (trans.audio_file) {
        trans.audio_file_id = Number(trans.audio_file.id);
      } else {
        trans.audio_file_id = null;
      }
    });

    onSubmit({
      ...form,
      audio_file_id: form.audio_file ? Number(form.audio_file.id) : null,
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

  const selectedAttachments = useMemo(
    () => documents.filter((doc) => form.attachments_ids?.includes(doc.id)),
    [documents, form.attachments_ids],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto border-slate-200 bg-white px-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>
            {story ? "Editar historia" : "Nueva historia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Info Row */}
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
                  <SelectValue placeholder="Selecciona categoría" />
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
              <Label htmlFor="historical_period">Periodo Histórico</Label>
              <Input
                id="historical_period"
                value={form.historical_period || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    historical_period: e.target.value,
                  }))
                }
                placeholder="Ej. Iberian, Roman, Medieval"
                className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select
                value={form.difficulty || "easy"}
                onValueChange={(val: string) =>
                  setForm((prev) => ({
                    ...prev,
                    difficulty: val,
                  }))
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Technical Info Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reading_time">Tiempo de lectura (min)</Label>
              <Input
                id="reading_time"
                type="number"
                min={1}
                value={form.reading_time || 5}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    reading_time: Math.max(1, Number(e.target.value)),
                  }))
                }
                className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source_name">Fuente</Label>
              <Input
                id="source_name"
                value={form.source_name || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    source_name: e.target.value,
                  }))
                }
                placeholder="Ej. Museu de Cabrera de Mar"
                className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_url">URL de la fuente</Label>
              <Input
                id="source_url"
                type="url"
                value={form.source_url || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    source_url: e.target.value,
                  }))
                }
                placeholder="https://..."
                className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          {/* Published Toggle */}
          <div className="grid gap-6 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
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
                <div className="relative w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-500 peer-checked:bg-primary-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Publicado
                </span>
              </label>
              <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                Visible para todos los usuarios en la aplicación móvil y portal
                de Cabrera de Mar.
              </p>
            </div>
          </div>

          {/* Translation Tabs */}
          <Tabs value={activeLang} onValueChange={setActiveLang}>
            <TabsList className="grid w-full grid-cols-4 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
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
                    <Label>Resumen</Label>
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
                      placeholder="Breve introducción o resumen..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenido Completo (Historia)</Label>
                    <Textarea
                      value={content.content || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "content",
                          e.target.value,
                        )
                      }
                      className="min-h-[120px]"
                      placeholder="Escribe la historia completa aquí..."
                    />
                  </div>

                  {/* Manual Audio Guide Upload */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/20">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-bold text-slate-800 dark:text-slate-200">
                        Archivo de Audioguía Manual ({lang.name})
                      </Label>
                      {content.audio_file ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 text-[10px] font-bold uppercase"
                          onClick={() => {
                            updateTranslatedField(
                              lang.code,
                              "audio_file",
                              null,
                            );
                            toast.info(
                              `Audio quitado para el idioma ${lang.name}`,
                            );
                          }}
                        >
                          Quitar Audio
                        </Button>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const toastId = toast.loading(
                                `Subiendo audioguía en ${lang.name}...`,
                              );
                              try {
                                const uploaded = await mediaApi.upload(file);
                                updateTranslatedField(
                                  lang.code,
                                  "audio_file",
                                  uploaded,
                                );
                                toast.success(
                                  `Audioguía en ${lang.name} subida correctamente`,
                                  { id: toastId },
                                );
                              } catch (err) {
                                console.error(err);
                                toast.error("No se pudo subir la audioguía", {
                                  id: toastId,
                                });
                              }
                            }}
                            className="hidden"
                            id={`audio-upload-${lang.code}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] uppercase font-bold"
                            onClick={() => {
                              document
                                .getElementById(`audio-upload-${lang.code}`)
                                ?.click();
                            }}
                          >
                            <Upload className="mr-1.5 h-3.5 w-3.5" /> Subir
                            Audio
                          </Button>
                        </div>
                      )}
                    </div>

                    {content.audio_file ? (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border p-2 rounded-lg text-xs">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[300px]">
                            {content.audio_file.original_name}
                          </span>
                        </div>
                        <audio
                          controls
                          src={content.audio_file.file}
                          className="w-full mt-2 h-10 border border-slate-200 rounded-md"
                        />
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground leading-normal mt-1">
                        Si no subes ningún archivo de audio para este idioma, el
                        portal público utilizará de forma automática el motor de
                        sintetizador inteligente (TTS) leyendo la descripción
                        superior.
                      </p>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Media Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Featured Image */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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

            {/* Audio Attachments */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-500" />
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground opacity-80">
                    Audio / Documentos Adjuntos
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
                      Sin audios o documentos adjuntos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="submit">
              {story ? "Guardar cambios" : "Crear historia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
