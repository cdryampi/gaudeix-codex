/**
 * Venue create/edit dialog component.
 */
import { useEffect, useState } from "react";
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
import { LANGUAGES } from "@/lib/config/constants";
import { CreateVenueDTO, Venue } from "../types";

type LocalVenueTranslations = {
  [lang: string]: {
    name: string;
    description?: string;
  };
};

type VenueForm = {
  address: string;
  postal_code: string;
  city: string;
  latitude: string;
  longitude: string;
  is_published: boolean;
  is_accessible: boolean;
};

const emptyForm: VenueForm = {
  address: "",
  postal_code: "",
  city: "",
  latitude: "",
  longitude: "",
  is_published: false,
  is_accessible: false,
};

const emptyBaseTranslation = {
  name: "",
  description: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateVenueDTO) => void;
  venue?: Venue;
};

export function VenueDialog({ open, onOpenChange, onSubmit, venue }: Props) {
  const [form, setForm] = useState<VenueForm>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalVenueTranslations>({
    ca: emptyBaseTranslation,
  });
  const [coordinateError, setCoordinateError] = useState<string | null>(null);

  useEffect(() => {
    if (venue) {
      setForm({
        address: venue.address,
        postal_code: venue.postal_code || "",
        city: venue.city,
        latitude: venue.latitude?.toString() || "",
        longitude: venue.longitude?.toString() || "",
        is_published: venue.is_published,
        is_accessible: venue.is_accessible,
      });
      setTranslations({
        ...venue.translations,
        ca: {
          name: venue.name,
          description: venue.description || "",
        },
      });
    } else {
      setForm(emptyForm);
      setTranslations({ ca: emptyBaseTranslation });
      setCoordinateError(null);
      setActiveLang("ca");
    }
  }, [venue, open]);

  const getTranslation = (lang: string) => {
    return translations[lang] || emptyBaseTranslation;
  };

  const updateTranslatedField = (
    lang: string,
    field: "name" | "description",
    value: string,
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || emptyBaseTranslation),
        [field]: value,
      },
    }));
  };

  const parseCoordinate = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const validateCoordinates = (
    latitude: number | null,
    longitude: number | null,
  ) => {
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      return "La latitud debe estar entre -90 y 90.";
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      return "La longitud debe estar entre -180 y 180.";
    }
    return null;
  };

  const buildTranslationsPayload = () => {
    const next: CreateVenueDTO["translations"] = {};

    Object.entries(translations).forEach(([lang, value]) => {
      const name = value.name.trim();
      const description = value.description?.trim();
      if (!name && !description) return;

      next[lang] = {
        name,
        description: description || undefined,
      };
    });

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const latitude = parseCoordinate(form.latitude);
    const longitude = parseCoordinate(form.longitude);
    const error = validateCoordinates(latitude, longitude);
    if (error) {
      setCoordinateError(error);
      return;
    }

    setCoordinateError(null);

    const payload: CreateVenueDTO = {
      address: form.address.trim(),
      postal_code: form.postal_code.trim() || null,
      city: form.city.trim(),
      latitude,
      longitude,
      is_published: form.is_published,
      is_accessible: form.is_accessible,
      translations: buildTranslationsPayload(),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {venue ? "Editar espacio" : "Nuevo espacio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label>Dirección</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Código postal</Label>
              <Input
                value={form.postal_code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, postal_code: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Latitud</Label>
              <Input
                type="number"
                step="any"
                min={-90}
                max={90}
                value={form.latitude}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, latitude: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Longitud</Label>
              <Input
                type="number"
                step="any"
                min={-180}
                max={180}
                value={form.longitude}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, longitude: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 p-4 border border-border rounded-xl bg-muted/10">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_published: e.target.checked,
                  }))
                }
              />
              <span className="text-sm font-medium">Publicado</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_accessible}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_accessible: e.target.checked,
                  }))
                }
              />
              <span className="text-sm font-medium">Accesible</span>
            </label>
          </div>

          {coordinateError && (
            <p className="text-sm text-destructive">{coordinateError}</p>
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
              const content = getTranslation(lang.code);
              const isBase = lang.code === "ca";
              return (
                <TabsContent
                  key={lang.code}
                  value={lang.code}
                  className="space-y-3 pt-4"
                >
                  <div className="space-y-2">
                    <Label>Nombre {isBase ? "" : `(${lang.name})`}</Label>
                    <Input
                      value={content.name || ""}
                      onChange={(e) =>
                        updateTranslatedField(lang.code, "name", e.target.value)
                      }
                      required={isBase}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={content.description || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "description",
                          e.target.value,
                        )
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="submit">
              {venue ? "Guardar cambios" : "Crear espacio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
