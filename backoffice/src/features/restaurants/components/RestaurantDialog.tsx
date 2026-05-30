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
import { ImageIcon, Upload, Utensils, X } from "lucide-react";
import { toast } from "sonner";
import type {
  Restaurant,
  RestaurantPayload,
  CuisineType,
  RestaurantAmenities,
} from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: RestaurantPayload) => Promise<void>;
  restaurant?: Restaurant;
};

type LocalTranslations = {
  [lang: string]: { title: string; description?: string };
};

const CUISINE_OPTIONS: { value: CuisineType; label: string }[] = [
  { value: "mediterranean", label: "Mediterránea" },
  { value: "italian", label: "Italiana" },
  { value: "asian", label: "Asiática" },
  { value: "fast_food", label: "Fast food" },
  { value: "traditional", label: "Tradicional" },
  { value: "tapas", label: "Tapas" },
  { value: "vegan", label: "Vegana" },
  { value: "other", label: "Otra" },
];

const AMENITY_OPTIONS: { key: keyof RestaurantAmenities; label: string }[] = [
  { key: "wifi", label: "WiFi" },
  { key: "terrace", label: "Terraza" },
  { key: "pet_friendly", label: "Pet friendly" },
  { key: "parking", label: "Parking" },
  { key: "wheelchair_access", label: "Acceso silla ruedas" },
  { key: "takeaway", label: "Take away" },
  { key: "kids_area", label: "Zona infantil" },
];

const emptyForm: RestaurantPayload = {
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
  cuisine_type: "mediterranean",
  amenities: {},
  capacity: null,
};

export function RestaurantDialog({
  open,
  onOpenChange,
  onSubmit,
  restaurant,
}: Props) {
  const [form, setForm] = useState<RestaurantPayload>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [images, setImages] = useState<MediaItem[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      mediaApi
        .listImages()
        .then(setImages)
        .catch(() => toast.error("No se pudieron cargar las imágenes"));
    }
  }, [open]);

  useEffect(() => {
    if (restaurant) {
      setForm({
        title: restaurant.title,
        description: restaurant.description || "",
        location_text: restaurant.location_text || "",
        latitude: restaurant.latitude ?? null,
        longitude: restaurant.longitude ?? null,
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        website: restaurant.website || "",
        booking_url: restaurant.booking_url || "",
        is_published: restaurant.is_published,
        featured_media_id: restaurant.featured_media?.id ?? null,
        cuisine_type: restaurant.cuisine_type,
        amenities: restaurant.amenities || {},
        capacity: restaurant.capacity ?? null,
      });
      setTranslations(restaurant.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [restaurant, open]);

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
    if (lang === "ca") {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setTranslations((prev) => ({
        ...prev,
        [lang]: { ...prev[lang], [field]: value },
      }));
    }
  };

  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );

  const toggleAmenity = (key: keyof RestaurantAmenities, checked: boolean) => {
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
            {restaurant ? "Editar restaurante" : "Nuevo restaurante"}
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
                  htmlFor="restaurant-is-published"
                  className="text-sm font-normal"
                >
                  Publicado
                </Label>
                <Switch
                  id="restaurant-is-published"
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
              <Utensils className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Datos del restaurante
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cuisine_type">Tipo de cocina</Label>
                <select
                  id="cuisine_type"
                  value={form.cuisine_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cuisine_type: e.target.value as CuisineType,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {CUISINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad (personas)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={form.capacity ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      capacity: e.target.value ? Number(e.target.value) : null,
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
                <Label htmlFor="booking_url">URL de reservas</Label>
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
            <Button type="submit">{restaurant ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
