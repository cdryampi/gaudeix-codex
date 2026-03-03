import { useEffect, useMemo, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/config/constants";
import { StaticPage, StaticPagePayload, StaticPageTemplate } from "../types";
import { TEMPLATE_OPTIONS } from "../constants/templates";
import { mediaApi } from "@/features/media/api/media";
import { MediaItem } from "@/features/media/types";
import { staticPagesApi } from "../api/staticPages";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: StaticPagePayload) => Promise<void>;
  page?: StaticPage;
};

type LocalTranslations = {
  [lang: string]: { titulo: string; cuerpo?: string };
};

const defaultTemplate: StaticPageTemplate = "info_point";

const emptyForm: StaticPagePayload = {
  slug: "",
  template: defaultTemplate,
  is_published: true,
  titulo: "",
  cuerpo: "",
  translations: {},
  featured_media_id: null,
  attachment_id: null,
};

export function StaticPageDialog({
  open,
  onOpenChange,
  onSubmit,
  page,
}: Props) {
  const [form, setForm] = useState<StaticPagePayload>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState<LocalTranslations>({});
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (page) {
      setForm({
        slug: page.slug,
        template: page.template,
        is_published: page.is_published,
        titulo: page.titulo,
        cuerpo: page.cuerpo || "",
        translations: page.translations || {},
        featured_media_id: page.featured_media?.id ?? null,
        attachment_id: page.attachment?.id ?? null,
      });
      setTranslations(page.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
    }
  }, [page, open]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
        ]);
        setImages(imgs);
        setDocuments(docs);
      } catch (err) {
        console.error("Error loading media options", err);
      }
    };
    if (open) loadOptions();
  }, [open]);

  const getContent = (lang: string) => {
    if (lang === "ca") {
      return { titulo: form.titulo, cuerpo: form.cuerpo };
    }
    return translations[lang] || { titulo: "", cuerpo: "" };
  };

  const updateField = (
    lang: string,
    field: "titulo" | "cuerpo",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    const payload: StaticPagePayload = {
      ...form,
      titulo: form.titulo || "",
      cuerpo: form.cuerpo || "",
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    };
    await onSubmit(payload);
  };

  const handleAutoTranslate = async (targetLang: string) => {
    if (!page) return;
    if (!form.titulo) {
      toast.error("No hay título en el idioma base para traducir");
      return;
    }
    setLoadingTranslate(true);
    try {
      const response = await staticPagesApi.autoTranslate(page.id, {
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
      toast.error("Error al traducir la página");
    } finally {
      setLoadingTranslate(false);
    }
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
      if (uploaded.type === "document") {
        setDocuments((prev) => [uploaded, ...prev]);
        setForm((prev) => ({ ...prev, attachment_id: uploaded.id }));
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir el documento");
    } finally {
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );
  const selectedDocument = useMemo(
    () => documents.find((doc) => doc.id === form.attachment_id),
    [documents, form.attachment_id],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] px-6">
        <DialogHeader>
          <DialogTitle>
            {page ? "Editar página estática" : "Nueva página estática"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
                disabled={!!page}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla</Label>
              <select
                id="template"
                value={form.template}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    template: e.target.value as StaticPageTemplate,
                  }))
                }
                disabled={!!page}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {TEMPLATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Cada plantilla es única. No se puede cambiar al editar para
                evitar duplicados.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
              <Label
                htmlFor="static-page-is-published"
                className="cursor-pointer text-sm font-normal"
              >
                Publicado
              </Label>
              <Switch
                id="static-page-is-published"
                checked={!!form.is_published}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_published: checked }))
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`titulo-${lang.code}`}>
                      Título {isBase ? "" : `(${lang.name})`}
                    </Label>
                    {!isBase && page && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoTranslate(lang.code)}
                        disabled={loadingTranslate || !form.titulo}
                      >
                        {loadingTranslate ? "Traduciendo..." : "Traducir IA"}
                      </Button>
                    )}
                  </div>
                  <Input
                    id={`titulo-${lang.code}`}
                    value={content.titulo || ""}
                    onChange={(e) =>
                      updateField(lang.code, "titulo", e.target.value)
                    }
                    required={isBase}
                    placeholder={isBase ? "" : "Traducción automática o manual"}
                  />
                  <div className="space-y-2">
                    <Label htmlFor={`cuerpo-${lang.code}`}>
                      Cuerpo {isBase ? "" : `(${lang.name})`}
                    </Label>
                    <RichTextEditor
                      value={content.cuerpo || ""}
                      onChange={(val) => updateField(lang.code, "cuerpo", val)}
                      placeholder={
                        isBase ? "Contenido" : "Traducción automática o manual"
                      }
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Imagen destacada
                </p>
                <p className="text-xs text-muted-foreground">
                  Se usará como hero o banner
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Subir
                </Button>
              </div>
            </div>
            <select
              value={form.featured_media_id ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  featured_media_id: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Sin imagen</option>
              {images.map((img) => (
                <option key={img.id} value={img.id}>
                  {img.original_name}
                </option>
              ))}
            </select>
            {selectedImage && (
              <div className="flex items-center gap-3 rounded-md bg-background/60 p-2">
                <img
                  src={
                    selectedImage.thumbnail_url ||
                    selectedImage.variant_thumbnail ||
                    selectedImage.file
                  }
                  alt="Miniatura"
                  className="h-14 w-14 rounded object-cover ring-1 ring-border"
                />
                <p className="text-sm text-foreground">
                  {selectedImage.original_name}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-rose-600"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, featured_media_id: null }))
                  }
                >
                  Quitar
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Documento adjunto
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF informativo o legal
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf,.ics,.txt,.docx,.xlsx"
                  ref={docInputRef}
                  onChange={handleUploadDoc}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => docInputRef.current?.click()}
                >
                  Subir
                </Button>
              </div>
            </div>
            <select
              value={form.attachment_id ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  attachment_id: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Sin documento</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.original_name}
                </option>
              ))}
            </select>
            {selectedDocument && (
              <div className="flex items-center justify-between rounded-md bg-background/60 px-2 py-1 text-sm">
                <span>{selectedDocument.original_name}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, attachment_id: null }))
                  }
                >
                  Quitar
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{page ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
