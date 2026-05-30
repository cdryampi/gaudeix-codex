import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { LANGUAGES } from "@/lib/config/constants";
import { mediaApi } from "@/features/media/api/media";
import type { MediaItem } from "@/features/media/types";
import { Building2, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type {
  Accommodation,
  AccommodationPayload,
  AccommodationType,
  AccommodationAmenities,
} from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AccommodationPayload) => Promise<void>;
  accommodation?: Accommodation;
};

type LocalTranslations = {
  [lang: string]: { title: string; description?: string };
};

const TYPE_OPTIONS: { value: AccommodationType; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "hostel", label: "Hostal" },
  { value: "apartment", label: "Apartamento" },
  { value: "campsite", label: "Camping" },
  { value: "rural", label: "Casa rural" },
  { value: "other", label: "Otro" },
];

const AMENITY_OPTIONS: { key: keyof AccommodationAmenities; label: string }[] =
  [
    { key: "wifi", label: "WiFi" },
    { key: "pool", label: "Piscina" },
    { key: "parking", label: "Parking" },
    { key: "ac", label: "Aire acondicionado" },
    { key: "heating", label: "Calefacción" },
    { key: "breakfast", label: "Desayuno" },
    { key: "gym", label: "Gimnasio" },
    { key: "spa", label: "Spa" },
    { key: "pets_allowed", label: "Mascotas" },
    { key: "wheelchair_access", label: "Acceso silla ruedas" },
  ];

const emptyForm: AccommodationPayload = {
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
  type: "hotel",
  stars: null,
  amenities: {},
  check_in_time: null,
  check_out_time: null,
};

export function AccommodationDialog({
  open,
  onOpenChange,
  onSubmit,
  accommodation,
}: Props) {
  const [form, setForm] = useState<AccommodationPayload>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [images, setImages] = useState<MediaItem[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open)
      mediaApi
        .listImages()
        .then(setImages)
        .catch(() => toast.error("No se pudieron cargar las imágenes"));
  }, [open]);

  useEffect(() => {
    if (accommodation) {
      setForm({
        title: accommodation.title,
        description: accommodation.description || "",
        location_text: accommodation.location_text || "",
        latitude: accommodation.latitude ?? null,
        longitude: accommodation.longitude ?? null,
        phone: accommodation.phone || "",
        email: accommodation.email || "",
        website: accommodation.website || "",
        booking_url: accommodation.booking_url || "",
        is_published: accommodation.is_published,
        featured_media_id: accommodation.featured_media?.id ?? null,
        type: accommodation.type,
        stars: accommodation.stars ?? null,
        amenities: accommodation.amenities || {},
        check_in_time: accommodation.check_in_time || null,
        check_out_time: accommodation.check_out_time || null,
      });
      setTranslations(accommodation.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [accommodation, open]);

  const getContent = (lang: string) => {
    if (lang === "ca")
      return { title: form.title, description: form.description };
    return translations[lang] || { title: "", description: "" };
  };

  const updateField = (
    lang: string,
    field: "title" | "description",
    value: string,
  ) => {
    if (lang === "ca") setForm((prev) => ({ ...prev, [field]: value }));
    else
      setTranslations((prev) => ({
        ...prev,
        [lang]: { ...prev[lang], [field]: value },
      }));
  };

  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );

  const toggleAmenity = (
    key: keyof AccommodationAmenities,
    checked: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: checked },
    }));
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
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    await onSubmit({
      ...form,
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[920px] overflow-y-auto px-6">
        <DialogHeader>
          <DialogTitle>
            {accommodation ? "Editar alojamiento" : "Nuevo alojamiento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Publicación
              </p>
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="accommodation-is-published"
                  className="text-sm font-normal"
                >
                  Publicado
                </Label>
                <Switch
                  id="accommodation-is-published"
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
              <Building2 className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Datos del alojamiento
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="accommodation-type">Tipo</Label>
                <select
                  id="accommodation-type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as AccommodationType,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stars">Estrellas</Label>
                <select
                  id="stars"
                  value={form.stars ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      stars: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>
                      {"★".repeat(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_in_time">Check-in</Label>
                <Input
                  id="check_in_time"
                  type="time"
                  value={form.check_in_time ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      check_in_time: e.target.value || null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_time">Check-out</Label>
                <Input
                  id="check_out_time"
                  type="time"
                  value={form.check_out_time ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      check_out_time: e.target.value || null,
                    }))
                  }
                />
              </div>
            </div>

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
                Ubicación y contacto
              </p>
              <div className="space-y-2">
                <Label htmlFor="accommodation-location_text">Ubicación</Label>
                <Input
                  id="accommodation-location_text"
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
                  <Label htmlFor="accommodation-latitude">Latitud</Label>
                  <Input
                    id="accommodation-latitude"
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
                  <Label htmlFor="accommodation-longitude">Longitud</Label>
                  <Input
                    id="accommodation-longitude"
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
                <Label htmlFor="accommodation-phone">Teléfono</Label>
                <Input
                  id="accommodation-phone"
                  value={form.phone || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accommodation-email">Email</Label>
                <Input
                  id="accommodation-email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accommodation-website">Web</Label>
                <Input
                  id="accommodation-website"
                  value={form.website || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, website: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accommodation-booking_url">
                  URL de reservas
                </Label>
                <Input
                  id="accommodation-booking_url"
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
            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">
                Servicios y amenities
              </p>
              <div className="space-y-3">
                {AMENITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-3 text-sm text-foreground"
                  >
                    <Checkbox
                      checked={!!form.amenities?.[opt.key]}
                      onCheckedChange={(checked) =>
                        toggleAmenity(opt.key, Boolean(checked))
                      }
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Imagen destacada
              </p>
            </div>
            <div className="flex items-start gap-4">
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
              {selectedImage ? (
                <div className="group relative aspect-video w-48 overflow-hidden rounded-lg border bg-background">
                  <img
                    src={
                      selectedImage.thumbnail_url ||
                      selectedImage.variant_medium ||
                      selectedImage.file
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, featured_media_id: null }))
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex aspect-video w-48 items-center justify-center rounded-lg border-2 border-dashed text-xs text-muted-foreground">
                  Sin imagen
                </div>
              )}
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
            <Button type="submit">{accommodation ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
