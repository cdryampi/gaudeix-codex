import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/config/constants";
import { mediaApi } from "@/features/media/api/media";
import { MediaItem } from "@/features/media/types";
import { ImageIcon, Upload, Waves, X } from "lucide-react";
import { toast } from "sonner";

import {
  Beach,
  BeachAccessibilityKey,
  BeachPayload,
  BeachServiceKey,
  BeachType,
  RecommendedForKey,
} from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BeachPayload) => Promise<void>;
  beach?: Beach;
};

type LocalTranslations = {
  [lang: string]: { title: string; description?: string };
};

const RECOMMENDED_FOR_OPTIONS: { key: RecommendedForKey; label: string }[] = [
  { key: "families", label: "Familias" },
  { key: "swimming", label: "Baño" },
  { key: "snorkeling", label: "Snorkel" },
  { key: "quiet_visit", label: "Visita tranquila" },
  { key: "sunset", label: "Atardecer" },
];

const SERVICE_OPTIONS: { key: BeachServiceKey; label: string }[] = [
  { key: "showers", label: "Duchas" },
  { key: "foot_wash", label: "Lavapiés" },
  { key: "toilets", label: "Aseos" },
  { key: "lifeguard_point", label: "Punto socorrismo" },
  { key: "sunbeds", label: "Hamacas" },
  { key: "beach_bar", label: "Chiringuito" },
];

const ACCESSIBILITY_OPTIONS: { key: BeachAccessibilityKey; label: string }[] = [
  { key: "accessible_access", label: "Acceso accesible" },
  { key: "accessible_walkway", label: "Pasarela accesible" },
  { key: "assisted_bath", label: "Baño asistido" },
  { key: "amphibious_chair", label: "Silla anfibia" },
  { key: "adapted_toilet", label: "Aseo adaptado" },
];

const BEACH_TYPE_OPTIONS: { value: BeachType; label: string }[] = [
  { value: "urban", label: "Urbana" },
  { value: "cove", label: "Cala" },
  { value: "natural", label: "Natural" },
];

const emptyForm: BeachPayload = {
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
  featured_media_id: null,
  gallery_ids: [],
  beach_type: "urban",
  environment_summary: "",
  recommended_for: [],
  length_m: null,
  access_notes: "",
  parking_info: "",
  public_transport_info: "",
  services: {},
  accessibility_features: {},
  translations: {},
};

export function BeachDialog({ open, onOpenChange, onSubmit, beach }: Props) {
  const [form, setForm] = useState<BeachPayload>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [images, setImages] = useState<MediaItem[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const imgs = await mediaApi.listImages();
        setImages(imgs);
      } catch (err) {
        console.error("Error cargando media", err);
        toast.error("No se pudieron cargar las imágenes");
      }
    };
    if (open) {
      void loadOptions();
    }
  }, [open]);

  useEffect(() => {
    if (beach) {
      setForm({
        title: beach.title,
        description: beach.description || "",
        location_text: beach.location_text || "",
        latitude: beach.latitude ?? null,
        longitude: beach.longitude ?? null,
        phone: beach.phone || "",
        email: beach.email || "",
        website: beach.website || "",
        booking_url: beach.booking_url || "",
        is_published: beach.is_published,
        featured_media_id: beach.featured_media?.id ?? null,
        gallery_ids: (beach.gallery || []).map((item) => item.id),
        beach_type: beach.beach_type,
        environment_summary: beach.environment_summary || "",
        recommended_for: beach.recommended_for || [],
        length_m: beach.length_m ?? null,
        access_notes: beach.access_notes || "",
        parking_info: beach.parking_info || "",
        public_transport_info: beach.public_transport_info || "",
        services: beach.services || {},
        accessibility_features: beach.accessibility_features || {},
      });
      setTranslations(beach.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [beach, open]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return { title: form.title, description: form.description };
    }
    return translations[lang] || { title: "", description: "" };
  };

  const updateField = (
    lang: string,
    field: "title" | "description",
    value: string,
  ) => {
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

  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );

  const selectedGallery = useMemo(() => {
    const ids = new Set(form.gallery_ids || []);
    return images.filter((img) => ids.has(img.id));
  }, [images, form.gallery_ids]);

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleUploadGallery = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      for (const file of files) {
        const uploaded = await mediaApi.upload(file);
        if (uploaded.type === "image") {
          setImages((prev) => [uploaded, ...prev]);
          setForm((prev) => ({
            ...prev,
            gallery_ids: [
              ...(prev.gallery_ids || []).filter((id) => id !== uploaded.id),
              uploaded.id,
            ],
          }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron subir las imágenes");
    } finally {
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const toggleRecommendedFor = (key: RecommendedForKey, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      recommended_for: checked
        ? [...(prev.recommended_for || []).filter((item) => item !== key), key]
        : (prev.recommended_for || []).filter((item) => item !== key),
    }));
  };

  const toggleBooleanMap = (
    field: "services" | "accessibility_features",
    key: string,
    checked: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [key]: checked,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    await onSubmit({
      ...form,
      gallery_ids: form.gallery_ids || [],
      recommended_for: form.recommended_for || [],
      services: form.services || {},
      accessibility_features: form.accessibility_features || {},
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[920px] overflow-y-auto px-6">
        <DialogHeader>
          <DialogTitle>{beach ? "Editar playa" : "Nueva playa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Publicación
                </p>
                <p className="text-xs text-muted-foreground">
                  La categoría se fija automáticamente a playas desde backend.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="beach-is-published"
                  className="text-sm font-normal"
                >
                  Publicada
                </Label>
                <Switch
                  id="beach-is-published"
                  checked={!!form.is_published}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, is_published: checked }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Identidad y contenido
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="beach_type">Tipo de playa</Label>
                <select
                  id="beach_type"
                  value={form.beach_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      beach_type: e.target.value as BeachType,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {BEACH_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="environment_summary">Resumen de entorno</Label>
                <Input
                  id="environment_summary"
                  value={form.environment_summary || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      environment_summary: e.target.value,
                    }))
                  }
                  placeholder="Ej: paseo marítimo, zona tranquila, vistas abiertas"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <Label htmlFor="length_m">Longitud aproximada (m)</Label>
                <Input
                  id="length_m"
                  type="number"
                  value={form.length_m ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      length_m: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                />
              </div>
            </div>

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
                    <div className="space-y-2">
                      <Label htmlFor={`title-${lang.code}`}>
                        Título {isBase ? "" : `(${lang.name})`}
                      </Label>
                      <Input
                        id={`title-${lang.code}`}
                        value={content.title || ""}
                        required={isBase}
                        onChange={(e) =>
                          updateField(lang.code, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${lang.code}`}>
                        Descripción {isBase ? "" : `(${lang.name})`}
                      </Label>
                      <RichTextEditor
                        value={content.description || ""}
                        onChange={(value) =>
                          updateField(lang.code, "description", value)
                        }
                        placeholder="Describe la playa y sus diferencias respecto a otras"
                      />
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">
                Acceso y orientación
              </p>
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
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    type="number"
                    value={form.latitude ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        latitude: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    type="number"
                    value={form.longitude ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        longitude: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_notes">Notas de acceso</Label>
                <Textarea
                  id="access_notes"
                  value={form.access_notes || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      access_notes: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking_info">Parking</Label>
                <Textarea
                  id="parking_info"
                  value={form.parking_info || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      parking_info: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="public_transport_info">
                  Transporte público
                </Label>
                <Textarea
                  id="public_transport_info"
                  value={form.public_transport_info || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      public_transport_info: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">Contacto</p>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={form.phone || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Web</Label>
                <Input
                  id="website"
                  value={form.website || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, website: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking_url">URL externa</Label>
                <Input
                  id="booking_url"
                  value={form.booking_url || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      booking_url: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <ChecklistCard title="Recomendada para">
              {RECOMMENDED_FOR_OPTIONS.map((option) => (
                <ChecklistItem
                  key={option.key}
                  checked={(form.recommended_for || []).includes(option.key)}
                  label={option.label}
                  onCheckedChange={(checked) =>
                    toggleRecommendedFor(option.key, checked)
                  }
                />
              ))}
            </ChecklistCard>

            <ChecklistCard title="Servicios">
              {SERVICE_OPTIONS.map((option) => (
                <ChecklistItem
                  key={option.key}
                  checked={!!form.services?.[option.key]}
                  label={option.label}
                  onCheckedChange={(checked) =>
                    toggleBooleanMap("services", option.key, checked)
                  }
                />
              ))}
            </ChecklistCard>

            <ChecklistCard title="Accesibilidad">
              {ACCESSIBILITY_OPTIONS.map((option) => (
                <ChecklistItem
                  key={option.key}
                  checked={!!form.accessibility_features?.[option.key]}
                  label={option.label}
                  onCheckedChange={(checked) =>
                    toggleBooleanMap(
                      "accessibility_features",
                      option.key,
                      checked,
                    )
                  }
                />
              ))}
            </ChecklistCard>
          </section>

          <section className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Galería y visuales
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Imagen destacada
                  </p>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleUploadImage}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Subir
                  </Button>
                </div>
                {selectedImage ? (
                  <div className="group relative aspect-video overflow-hidden rounded-lg border bg-background">
                    <img
                      src={
                        selectedImage.thumbnail_url ||
                        selectedImage.variant_medium ||
                        selectedImage.file
                      }
                      alt="Imagen destacada"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            featured_media_id: null,
                          }))
                        }
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                    Sin imagen destacada
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Galería
                  </p>
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
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Añadir
                  </Button>
                </div>
                {selectedGallery.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedGallery.map((img) => (
                      <div
                        key={img.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-background"
                      >
                        <img
                          src={
                            img.thumbnail_url ||
                            img.variant_thumbnail ||
                            img.file
                          }
                          alt={img.original_name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              gallery_ids: (prev.gallery_ids || []).filter(
                                (id) => id !== img.id,
                              ),
                            }))
                          }
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`Quitar ${img.original_name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                    Sin imágenes adicionales
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{beach ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChecklistCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ChecklistItem({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-foreground">
      <Checkbox
        checked={checked}
        onChange={(e) => onCheckedChange(Boolean(e.target.checked))}
      />
      <span>{label}</span>
    </label>
  );
}
