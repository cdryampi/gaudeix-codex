/**
 * Program create/edit dialog component.
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
import { CreateProgramDTO, Festa, Program, ProgramStatus } from "../types";

type LocalProgramTranslations = {
  [lang: string]: {
    title: string;
    subtitle?: string;
    description?: string;
  };
};

type ProgramForm = {
  festa_id: number;
  status: ProgramStatus;
  order: number;
  start_date: string;
  end_date: string;
};

const emptyForm: ProgramForm = {
  festa_id: 0,
  status: "draft",
  order: 0,
  start_date: "",
  end_date: "",
};

const emptyBaseTranslation = {
  title: "",
  subtitle: "",
  description: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProgramDTO) => void;
  program?: Program;
  festes: Festa[];
};

export function ProgramDialog({
  open,
  onOpenChange,
  onSubmit,
  program,
  festes,
}: Props) {
  const [form, setForm] = useState<ProgramForm>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalProgramTranslations>({
    ca: emptyBaseTranslation,
  });

  useEffect(() => {
    if (program) {
      setForm({
        festa_id: program.festa,
        status: program.status,
        order: program.order,
        start_date: program.start_date || "",
        end_date: program.end_date || "",
      });
      setTranslations({
        ...program.translations,
        ca: {
          title: program.title,
          subtitle: program.subtitle || "",
          description: program.description || "",
        },
      });
    } else {
      setForm({
        ...emptyForm,
        festa_id: festes[0]?.id || 0,
      });
      setTranslations({ ca: emptyBaseTranslation });
      setActiveLang("ca");
    }
  }, [program?.id, open, festes]);

  const getTranslation = (lang: string) => {
    return translations[lang] || emptyBaseTranslation;
  };

  const updateTranslatedField = (
    lang: string,
    field: "title" | "subtitle" | "description",
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

  const buildTranslationsPayload = () => {
    const next: CreateProgramDTO["translations"] = {};

    Object.entries(translations).forEach(([lang, value]) => {
      const title = value.title.trim();
      const subtitle = value.subtitle?.trim();
      const description = value.description?.trim();
      if (!title && !subtitle && !description) return;

      next[lang] = {
        title,
        subtitle: subtitle || undefined,
        description: description || undefined,
      };
    });

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateProgramDTO = {
      festa_id: form.festa_id,
      status: form.status,
      order: Number.isFinite(form.order) ? form.order : 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      translations: buildTranslationsPayload(),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{program ? "Editar programa" : "Nuevo programa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Festa</Label>
              <select
                value={form.festa_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    festa_id: Number(e.target.value),
                  }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                {festes.map((festa) => (
                  <option key={festa.id} value={festa.id}>
                    {festa.title} ({festa.year})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as ProgramStatus,
                  }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, order: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha inicio</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, start_date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, end_date: e.target.value }))
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
              const content = getTranslation(lang.code);
              const isBase = lang.code === "ca";
              return (
                <TabsContent key={lang.code} value={lang.code} className="space-y-3 pt-4">
                  <div className="space-y-2">
                    <Label>Título {isBase ? "" : `(${lang.name})`}</Label>
                    <Input
                      value={content.title || ""}
                      onChange={(e) =>
                        updateTranslatedField(lang.code, "title", e.target.value)
                      }
                      required={isBase}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={content.subtitle || ""}
                      onChange={(e) =>
                        updateTranslatedField(lang.code, "subtitle", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={content.description || ""}
                      onChange={(e) =>
                        updateTranslatedField(lang.code, "description", e.target.value)
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="submit">{program ? "Guardar cambios" : "Crear programa"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
