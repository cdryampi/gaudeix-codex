/**
 * Festa create/edit dialog component.
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
import { CreateFestaDTO, Festa } from "../types";

type LocalTranslations = {
  [lang: string]: {
    title: string;
    subtitle?: string;
    summary?: string;
    description?: string;
    program_text?: string;
  };
};

const emptyForm: CreateFestaDTO = {
  title: "",
  subtitle: "",
  summary: "",
  description: "",
  program_text: "",
  start_date: "",
  end_date: "",
  year: new Date().getFullYear(),
  is_published: false,
  is_featured: false,
  is_current: false,
  translations: {},
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFestaDTO) => void;
  festa?: Festa;
};

export function FestaDialog({ open, onOpenChange, onSubmit, festa }: Props) {
  const [form, setForm] = useState<CreateFestaDTO>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});

  useEffect(() => {
    if (festa) {
      setForm({
        title: festa.title,
        subtitle: festa.subtitle || "",
        summary: festa.summary || "",
        description: festa.description || "",
        program_text: festa.program_text || "",
        start_date: festa.start_date,
        end_date: festa.end_date,
        year: festa.year,
        is_published: festa.is_published,
        is_featured: festa.is_featured,
        is_current: festa.is_current,
        category_id: festa.category ?? null,
        featured_media_id: festa.featured_media?.id ?? null,
        poster_id: festa.poster?.id ?? null,
        program_pdf_id: festa.program_pdf?.id ?? null,
      });
      setTranslations(festa.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [festa?.id, open]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return {
        title: form.title,
        subtitle: form.subtitle,
        summary: form.summary,
        description: form.description,
        program_text: form.program_text,
      };
    }
    const trans = translations[lang] || {
      title: "",
      subtitle: "",
      summary: "",
      description: "",
      program_text: "",
    };
    return {
      title: trans.title || "",
      subtitle: trans.subtitle || "",
      summary: trans.summary || "",
      description: trans.description || "",
      program_text: trans.program_text || "",
    };
  };

  const updateTranslatedField = (
    lang: string,
    field: "title" | "subtitle" | "summary" | "description" | "program_text",
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
          <DialogTitle>{festa ? "Editar festa" : "Nueva festa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dates and Year */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Año</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    year: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha inicio</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
                required
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
                  checked={!!form.is_current}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_current: e.target.checked,
                    }))
                  }
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                <span className="select-none ms-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Festa actual
                </span>
              </label>
              <p className="text-[10px] text-muted-foreground leading-tight pl-12">
                Solo puede haber una festa actual a la vez.
              </p>
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
                    <Label>Subtítulo</Label>
                    <Input
                      value={content.subtitle || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "subtitle",
                          e.target.value,
                        )
                      }
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
                    <Label>Texto del programa</Label>
                    <Textarea
                      value={content.program_text || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "program_text",
                          e.target.value,
                        )
                      }
                      className="min-h-[72px]"
                      placeholder="Descripción del programa de actos..."
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="submit">
              {festa ? "Guardar cambios" : "Crear festa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
