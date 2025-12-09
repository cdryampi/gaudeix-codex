import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TranslationDialog } from "./TranslationDialog";
import { CreateEventDTO, Event } from "../types";
import { mediaApi } from "@/features/media/api/media";
import { MediaItem } from "@/features/media/types";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/config/constants";
import { llmApi } from "../api/llm";

const emptyForm: CreateEventDTO = {
  title: "",
  description: "",
  start_at: "",
  end_at: "",
  is_published: true,
  location_text: "",
  featured_media: null,
  attachments: [],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEventDTO) => void;
  event?: Event;
};

export function EventDialog({ open, onOpenChange, onSubmit, event }: Props) {
  const [formData, setFormData] = useState<CreateEventDTO>(emptyForm);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("ca");
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState<{
    [lang: string]: { title: string; description: string };
  }>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        start_at: toDatetimeLocal(event.start_at),
        end_at: event.end_at ? toDatetimeLocal(event.end_at) : "",
        is_published: event.is_published,
        location_text: event.location_text || "",
        featured_media_id: event.featured_media?.id ?? null,
        attachments_ids: (event.attachments || []).map((a) => a.id),
      });
      setSelectedImageId(event.featured_media?.id ?? null);
      setSelectedDocs((event.attachments || []).map((a) => a.id));
      
      // Load existing translations
      if (event.translations) {
        setTranslations(event.translations);
      } else {
        setTranslations({});
      }
    } else {
      setFormData(emptyForm);
      setSelectedImageId(null);
      setSelectedDocs([]);
      setTranslations({});
    }
  }, [event, open]);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const [imgs, docs] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
        ]);
        setImages(imgs);
        setDocuments(docs);
      } catch (err) {
        console.error("Error cargando media", err);
      }
    };
    if (open) {
      loadMedia();
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    const parsedValue =
      type === "checkbox" ? checked : type === "number" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build translations object excluding the source language
    const translationsData: { [lang: string]: { title: string; description?: string } } = {};
    Object.entries(translations).forEach(([lang, content]) => {
      if (lang !== "ca" && (content.title || content.description)) {
        translationsData[lang] = {
          title: content.title,
          description: content.description,
        };
      }
    });
    
    onSubmit({
      ...formData,
      start_at: toIso(formData.start_at),
      end_at: formData.end_at ? toIso(formData.end_at) : null,
      featured_media_id: selectedImageId,
      attachments_ids: selectedDocs,
      translations: Object.keys(translationsData).length > 0 ? translationsData : undefined,
    });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await mediaApi.upload(file);
      if (uploaded.type === "image") {
        setImages((prev) => [uploaded, ...prev]);
        setSelectedImageId(uploaded.id);
      }
    } catch (err) {
      console.error("Error subiendo imagen", err);
      alert("No se pudo subir la imagen.");
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
      setSelectedDocs((prev) => Array.from(new Set([...prev, uploaded.id])));
    } catch (err) {
      console.error("Error subiendo documento", err);
      alert("No se pudo subir el documento.");
    } finally {
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: number) => {
    setSelectedDocs((prev) => prev.filter((docId) => docId !== id));
  };

  const handleTranslateToLanguage = async (targetLang: string) => {
    if (!event) return;
    
    const sourceLang = "ca"; // Always translate from Catalan
    const sourceTitle = formData.title || event.title;
    const sourceDescription = formData.description || event.description;

    if (!sourceTitle) {
      toast.error("No hay título para traducir");
      return;
    }

    setTranslating(true);
    
    try {
      const response = await llmApi.autoTranslateEvent(String(event.id));
      
      if (response.success && response.translations[targetLang]) {
        const translation = response.translations[targetLang];
        
        // Update translations state
        setTranslations(prev => ({
          ...prev,
          [targetLang]: translation
        }));
        
        toast.success(`Traducido a ${LANGUAGES.find(l => l.code === targetLang)?.name}`);
      } else {
        toast.error("Error al traducir", {
          description: response.errors?.[targetLang] || "Error desconocido"
        });
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Error al conectar con el servicio de traducción");
    } finally {
      setTranslating(false);
    }
  };

  const getCurrentContent = (lang: string) => {
    if (lang === "ca") {
      return {
        title: formData.title,
        description: formData.description
      };
    }
    return translations[lang] || { title: "", description: "" };
  };

  const handleContentChange = (lang: string, field: "title" | "description", value: string) => {
    if (lang === "ca") {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setTranslations(prev => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [field]: value
        }
      }));
    }
  };

  const handleApplyTranslations = (translations: {
    [lang: string]: { title: string; description: string };
  }) => {
    // The backend auto_translate endpoint already saved the translations
    // We just need to show success feedback to the user
    const languageCount = Object.keys(translations).length;
    const languages = Object.keys(translations)
      .map((lang) => lang.toUpperCase())
      .join(", ");

    toast.success(
      `Traducciones aplicadas correctamente`,
      {
        description: `El evento ha sido traducido a ${languageCount} idioma${languageCount > 1 ? "s" : ""}: ${languages}`,
      }
    );

    // Update local translations state
    setTranslations(prev => ({ ...prev, ...translations }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] px-6">
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Nuevo evento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tabs para selección de idioma */}
          <Tabs defaultValue="ca" value={activeLanguage} onValueChange={setActiveLanguage}>
            <TabsList className="grid w-full grid-cols-4">
              {LANGUAGES.map((lang) => (
                <TabsTrigger key={lang.code} value={lang.code}>
                  {lang.emoji} {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map((lang) => {
              const content = getCurrentContent(lang.code);
              const isSourceLang = lang.code === "ca";

              return (
                <TabsContent key={lang.code} value={lang.code} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`title-${lang.code}`}>
                        Título {!isSourceLang && `(${lang.name})`}
                      </Label>
                      {!isSourceLang && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleTranslateToLanguage(lang.code)}
                          disabled={translating || !formData.title}
                        >
                          {translating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Traduciendo...
                            </>
                          ) : (
                            "Traducir desde Català"
                          )}
                        </Button>
                      )}
                    </div>
                    <Input
                      id={`title-${lang.code}`}
                      value={content.title || ""}
                      onChange={(e) => handleContentChange(lang.code, "title", e.target.value)}
                      required={isSourceLang}
                      placeholder={isSourceLang ? "" : "Traducción automática o manual"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${lang.code}`}>
                      Descripción {!isSourceLang && `(${lang.name})`}
                    </Label>
                    <RichTextEditor
                      value={content.description || ""}
                      onChange={(value) => handleContentChange(lang.code, "description", value)}
                      placeholder={
                        isSourceLang
                          ? "Describe el evento en detalle..."
                          : "Traducción automática o manual"
                      }
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location_text">Ubicación</Label>
              <Input
                id="location_text"
                name="location_text"
                value={formData.location_text}
                onChange={handleChange}
                placeholder="Descripción o dirección"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_at">Inicio</Label>
              <Input
                id="start_at"
                name="start_at"
                type="datetime-local"
                value={formData.start_at}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_at">Fin (opcional)</Label>
              <Input
                id="end_at"
                name="end_at"
                type="datetime-local"
                value={formData.end_at || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
            <span>Publicado</span>
            <input
              type="checkbox"
              name="is_published"
              checked={!!formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 accent-primary"
            />
          </label>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Imagen destacada
                </p>
                <p className="text-xs text-muted-foreground">
                  Miniatura visible en listados
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Subir
                </Button>
                <select
                  value={selectedImageId ?? ""}
                  onChange={(e) =>
                    setSelectedImageId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <option value="">Sin imagen</option>
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.original_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedImageId && (
              <div className="flex items-center gap-3 rounded-md bg-background/60 p-2">
                <img
                  src={
                    images.find((img) => img.id === selectedImageId)
                      ?.thumbnail_url ||
                    images.find((img) => img.id === selectedImageId)
                      ?.variant_thumbnail ||
                    images.find((img) => img.id === selectedImageId)?.file
                  }
                  alt="Miniatura"
                  className="h-14 w-14 rounded object-cover ring-1 ring-border"
                />
                <p className="text-sm text-foreground">
                  {
                    images.find((img) => img.id === selectedImageId)
                      ?.original_name
                  }
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-rose-600"
                  onClick={() => setSelectedImageId(null)}
                >
                  Quitar
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Adjuntos
                </p>
                <p className="text-xs text-muted-foreground">
                  Documentos vinculados al evento
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf,.ics,.txt,.docx,.xlsx"
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
                  Subir
                </Button>
                <select
                  multiple
                  value={selectedDocs.map(String)}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map(
                      (opt) => Number(opt.value)
                    );
                    setSelectedDocs(values);
                  }}
                  className="h-24 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.original_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedDocs.length > 0 && (
              <div className="space-y-1 text-sm">
                {selectedDocs.map((id) => {
                  const doc = documents.find((d) => d.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-md bg-background/60 px-2 py-1"
                    >
                      <span>{doc?.original_name || `Documento ${id}`}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() => removeAttachment(id)}
                      >
                        Quitar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {event && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setTranslationDialogOpen(true)}
              >
                <Languages className="mr-2 h-4 w-4" />
                Traducir con IA
              </Button>
            )}
            <Button type="submit">{event ? "Guardar cambios" : "Crear"}</Button>
          </div>
        </form>

        {/* Translation Dialog */}
        {event && (
          <TranslationDialog
            open={translationDialogOpen}
            onOpenChange={setTranslationDialogOpen}
            eventId={String(event.id)}
            currentTitle={formData.title}
            currentDescription={formData.description || ""}
            onApplyTranslations={handleApplyTranslations}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function toDatetimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  const iso = date.toISOString();
  return iso.slice(0, 16);
}

function toIso(value: string) {
  if (!value) return value;
  // value comes as 'YYYY-MM-DDTHH:MM'
  const date = new Date(value);
  return date.toISOString();
}
