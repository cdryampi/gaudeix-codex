/**
 * Route create/edit dialog component.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/config/constants";
import { CreateRouteDTO, DifficultyLevel, Route, RouteType } from "../types";

type LocalTranslations = {
  [lang: string]: {
    title: string;
    summary?: string;
    description?: string;
    instructions?: string;
  };
};

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
  translations: {},
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRouteDTO) => void;
  route?: Route;
};

export function RouteDialog({ open, onOpenChange, onSubmit, route }: Props) {
  const [form, setForm] = useState<CreateRouteDTO>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});

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
        is_circular: route.is_circular,
        is_published: route.is_published,
        is_featured: route.is_featured,
        category_id: route.category ?? null,
        featured_media_id: route.featured_media?.id ?? null,
      });
      setTranslations(route.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [route?.id, open]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const translationsPayload: LocalTranslations = { ...translations };
    delete translationsPayload["ca"];

    onSubmit({
      ...form,
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{route ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Route Type and Difficulty */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de ruta</Label>
              <Select
                value={form.route_type}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, route_type: val as RouteType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">A peu</SelectItem>
                  <SelectItem value="cycling">Bicicleta</SelectItem>
                  <SelectItem value="guided">Guiada</SelectItem>
                  <SelectItem value="mixed">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dificultad</Label>
              <Select
                value={form.difficulty}
                onValueChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    difficulty: val as DifficultyLevel,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fàcil</SelectItem>
                  <SelectItem value="moderate">Moderada</SelectItem>
                  <SelectItem value="difficult">Difícil</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Technical Data */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Distancia (km)</Label>
              <Input
                type="number"
                step="0.1"
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

          {/* Toggles */}
          <div className="grid gap-6 md:grid-cols-3 p-4 border border-border rounded-xl bg-muted/10">
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
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Publicada
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!form.is_featured}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_featured: e.target.checked,
                    }))
                  }
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Destacada
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!form.is_circular}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_circular: e.target.checked,
                    }))
                  }
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Circular
                </span>
              </label>
            </div>
          </div>

          {/* Translations */}
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
                    <Label>Resumen breve</Label>
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

                  <div className="space-y-2">
                    <Label>Instrucciones</Label>
                    <Textarea
                      value={content.instructions || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "instructions",
                          e.target.value,
                        )
                      }
                      className="min-h-[72px]"
                      placeholder="Indicaciones para seguir la ruta..."
                    />
                  </div>
                </TabsContent>
              );
            })}
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
