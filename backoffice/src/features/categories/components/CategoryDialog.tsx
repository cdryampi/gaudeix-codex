import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/lib/config/constants";
import { Category, CategoryPayload } from "../types";
import { categoriesApi } from "../api/categories";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CategoryPayload) => Promise<void>;
  category?: Category;
};

type LocalTranslations = {
  [lang: string]: { nombre: string; descripcion?: string };
};

const emptyForm: CategoryPayload = {
  slug: "",
  taxonomy: "",
  nombre: "",
  descripcion: "",
  translations: {},
};

export function CategoryDialog({ open, onOpenChange, onSubmit, category }: Props) {
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [loadingTranslate, setLoadingTranslate] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        slug: category.slug,
        taxonomy: category.taxonomy || "",
        nombre: category.nombre,
        descripcion: category.descripcion || "",
        translations: category.translations || {},
      });
      setTranslations(category.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
    }
  }, [category, open]);

  const updateField = (lang: string, field: "nombre" | "descripcion", value: string) => {
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

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return { nombre: form.nombre, descripcion: form.descripcion };
    }
    return translations[lang] || { nombre: "", descripcion: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    const payload: CategoryPayload = {
      ...form,
      translations: Object.keys(translationsPayload).length ? translationsPayload : undefined,
    };
    await onSubmit(payload);
  };

  const handleAutoTranslate = async (targetLang: string) => {
    if (!category) return;
    if (!form.nombre) {
      toast.error("No hay nombre en el idioma base para traducir");
      return;
    }
    setLoadingTranslate(true);
    try {
      const response = await categoriesApi.autoTranslate(category.id, {
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
      toast.error("Error al traducir categoría");
    } finally {
      setLoadingTranslate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] px-6">
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                required
                disabled={!!category}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxonomy">Taxonomía</Label>
              <Input
                id="taxonomy"
                name="taxonomy"
                value={form.taxonomy || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, taxonomy: e.target.value }))}
                placeholder="template, theme, etc."
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
                    <Label htmlFor={`nombre-${lang.code}`}>Nombre {isBase ? "" : `(${lang.name})`}</Label>
                    {!isBase && category && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoTranslate(lang.code)}
                        disabled={loadingTranslate || !form.nombre}
                      >
                        {loadingTranslate ? "Traduciendo..." : "Traducir IA"}
                      </Button>
                    )}
                  </div>
                  <Input
                    id={`nombre-${lang.code}`}
                    value={content.nombre || ""}
                    onChange={(e) => updateField(lang.code, "nombre", e.target.value)}
                    required={isBase}
                    placeholder={isBase ? "" : "Traducción automática o manual"}
                  />
                  <div className="space-y-2">
                    <Label htmlFor={`descripcion-${lang.code}`}>Descripción {isBase ? "" : `(${lang.name})`}</Label>
                    <Textarea
                      id={`descripcion-${lang.code}`}
                      value={content.descripcion || ""}
                      onChange={(e) => updateField(lang.code, "descripcion", e.target.value)}
                      placeholder={isBase ? "Descripción" : "Traducción automática o manual"}
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{category ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
