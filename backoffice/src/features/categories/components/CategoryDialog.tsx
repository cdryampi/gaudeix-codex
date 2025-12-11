import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "../constants/icons";
import { Category, CategoryPayload } from "../types";
import { categoriesApi } from "../api/categories";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CategoryPayload) => Promise<void>;
  category?: Category;
  categories?: Category[];
};

type LocalTranslations = {
  [lang: string]: { nombre: string; descripcion?: string };
};

const emptyForm: CategoryPayload = {
  slug: "",
  taxonomy: "",
  icon: "",
  parent: null,
  nombre: "",
  descripcion: "",
  translations: {},
};

export function CategoryDialog({ open, onOpenChange, onSubmit, category, categories = [] }: Props) {
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const IconPreview = getCategoryIcon(form.icon);
  const parentOptions = categories.filter((c) => !category || c.id !== category.id);

  useEffect(() => {
    if (category) {
      setForm({
        slug: category.slug,
        taxonomy: category.taxonomy || "",
        icon: category.icon || "",
        parent: category.parent ?? null,
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

  const handleIconChange = (value: string) => {
    setForm((prev) => ({ ...prev, icon: value }));
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
    const iconValue = form.icon?.trim() ?? "";
    const payload: CategoryPayload = {
      ...form,
      parent: form.parent ?? null,
      icon: iconValue,
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
            <div className="space-y-2">
              <Label htmlFor="parent">Categoría padre (opcional)</Label>
              <select
                id="parent"
                value={form.parent ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, parent: e.target.value ? Number(e.target.value) : null }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="">Sin padre</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.nombre} ({opt.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Icono</p>
                <p className="text-xs text-muted-foreground">
                  Selecciona un icono (Lucide) para mostrarlo en los listados del backoffice.
                </p>
              </div>
              {IconPreview && (
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/70 bg-background">
                  <IconPreview className="h-5 w-5 text-foreground" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORY_ICON_OPTIONS.map((option) => {
                const OptionIcon = option.icon;
                const isActive = form.icon === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition",
                      isActive ? "border-primary bg-primary/10 text-primary" : "border-border/70 hover:border-primary/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isActive}
                      onChange={() => handleIconChange(isActive ? "" : option.value)}
                      aria-label={`Icono ${option.labelEs}`}
                    />
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background">
                      <OptionIcon className="h-4 w-4" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">{option.labelEs}</div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-bold">{option.labelCa}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Input
                id="icon"
                name="icon"
                value={form.icon || ""}
                onChange={(e) => handleIconChange(e.target.value)}
                list="category-icon-suggestions"
                placeholder="castle, flag, mountain..."
              />
              {form.icon && (
                <div className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-md border border-border/70 bg-background px-2">
                  {IconPreview ? (
                    <IconPreview className="h-5 w-5 text-foreground" />
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground">?</span>
                  )}
                </div>
              )}
            </div>
            <datalist id="category-icon-suggestions">
              {CATEGORY_ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.labelEs}
                </option>
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Usa el nombre del icono en kebab-case (ej. castle, party-popper). Puedes escribirlo o elegir uno sugerido.
            </p>
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
