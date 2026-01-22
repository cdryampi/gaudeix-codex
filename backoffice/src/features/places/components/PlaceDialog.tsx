import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/lib/config/constants";
import { Place, PlacePayload } from "../types";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";
import { MediaItem } from "@/features/media/types";
import { placesApi } from "../api/places";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: PlacePayload) => Promise<void>;
  place?: Place;
};

type LocalTranslations = {
  [lang: string]: { title: string; description?: string };
};

const emptyForm: PlacePayload = {
  title: "",
  description: "",
  location_text: "",
  latitude: null,
  longitude: null,
  phone: "",
  email: "",
  website: "",
  booking_url: "",
  is_published: true,
  category_id: null,
  featured_media_id: null,
  attachments_ids: [],
  translations: {},
};

export function PlaceDialog({ open, onOpenChange, onSubmit, place }: Props) {
  const [form, setForm] = useState<PlacePayload>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (place) {
      setForm({
        title: place.title,
        description: place.description || "",
        location_text: place.location_text || "",
        latitude: place.latitude ?? null,
        longitude: place.longitude ?? null,
        phone: place.phone || "",
        email: place.email || "",
        website: place.website || "",
        booking_url: place.booking_url || "",
        is_published: place.is_published,
        category_id: place.category ?? null,
        featured_media_id: place.featured_media?.id ?? null,
        attachments_ids: (place.attachments || []).map((a) => a.id),
      });
      setTranslations(place.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
    }
  }, [place, open]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs, cats] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          categoriesApi.list({ taxonomy: "template" }),
        ]);
        setImages(imgs);
        setDocuments(docs);
        setCategories(cats);
      } catch (err) {
        console.error("Error cargando opciones", err);
      }
    };
    if (open) loadOptions();
  }, [open]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return { title: form.title, description: form.description };
    }
    return translations[lang] || { title: "", description: "" };
  };

  const updateField = (lang: string, field: "title" | "description", value: string) => {
    if (lang === "ca") {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setTranslations((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [field]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    const payload: PlacePayload = {
      ...form,
      translations: Object.keys(translationsPayload).length ? translationsPayload : undefined,
    };
    await onSubmit(payload);
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
        attachments_ids: Array.from(new Set([...(prev.attachments_ids || []), uploaded.id])),
      }));
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir el documento");
    } finally {
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const handleAutoTranslate = async (targetLang: string) => {
    if (!place) return;
    if (!form.title) {
      toast.error("No hay título en el idioma base para traducir");
      return;
    }
    setLoadingTranslate(true);
    try {
      const response = await placesApi.autoTranslate(place.id, {
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
      toast.error("No se pudo traducir el lugar");
    } finally {
      setLoadingTranslate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] px-6">
        <DialogHeader>
          <DialogTitle>{place ? "Editar lugar" : "Nuevo lugar"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location_text">Ubicación</Label>
              <Input
                id="location_text"
                value={form.location_text || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, location_text: e.target.value }))}
                placeholder="Dirección o referencia"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  type="number"
                  value={form.latitude ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, latitude: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="41.4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  type="number"
                  value={form.longitude ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, longitude: e.target.value ? Number(e.target.value) : null }))
                  }
                  placeholder="2.17"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={form.phone || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_url">Booking URL</Label>
              <Input
                id="booking_url"
                value={form.booking_url || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, booking_url: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={form.category_id ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category_id: e.target.value ? Number(e.target.value) : null }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre} ({cat.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
              <Label htmlFor="place-is-published" className="cursor-pointer text-sm font-normal">
                Publicado
              </Label>
              <Switch
                id="place-is-published"
                checked={!!form.is_published}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_published: checked }))}
              />
            </div>
          </div>

          <Tabs value={activeLang} onValueChange={setActiveLang} defaultValue="ca">
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
                <TabsContent key={lang.code} value={lang.code} className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`title-${lang.code}`}>Título {isBase ? "" : `(${lang.name})`}</Label>
                    {!isBase && place && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoTranslate(lang.code)}
                        disabled={loadingTranslate || !form.title}
                      >
                        {loadingTranslate ? "Traduciendo..." : "Traducir IA"}
                      </Button>
                    )}
                  </div>
                  <Input
                    id={`title-${lang.code}`}
                    value={content.title || ""}
                    onChange={(e) => updateField(lang.code, "title", e.target.value)}
                    required={isBase}
                    placeholder={isBase ? "" : "Traducción automática o manual"}
                  />
                  <div className="space-y-2">
                    <Label htmlFor={`description-${lang.code}`}>Descripción {isBase ? "" : `(${lang.name})`}</Label>
                    <RichTextEditor
                      value={content.description || ""}
                      onChange={(value) => updateField(lang.code, "description", value)}
                      placeholder={isBase ? "Descripción del lugar" : "Traducción automática o manual"}
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Imagen destacada</p>
                <p className="text-xs text-muted-foreground">Miniatura visible en listados</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                  Subir
                </Button>
                <select
                  value={form.featured_media_id ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      featured_media_id: e.target.value ? Number(e.target.value) : null,
                    }))
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
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Adjuntos</p>
                <p className="text-xs text-muted-foreground">Documentos vinculados al lugar</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf,.ics,.txt,.docx,.xlsx"
                  ref={docInputRef}
                  onChange={handleUploadDoc}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => docInputRef.current?.click()}>
                  Subir
                </Button>
                <select
                  multiple
                  value={(form.attachments_ids || []).map(String)}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
                    setForm((prev) => ({ ...prev, attachments_ids: values }));
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
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{place ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
