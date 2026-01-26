import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { TEMPLATE_OPTIONS } from "../constants/templates";
import { mediaApi } from "@/features/media/api/media";
import { staticPagesApi } from "../api/staticPages";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
const defaultTemplate = "info_point";
const emptyForm = {
  slug: "",
  template: defaultTemplate,
  is_published: true,
  titulo: "",
  cuerpo: "",
  translations: {},
  featured_media_id: null,
  attachment_id: null,
};
export function StaticPageDialog({ open, onOpenChange, onSubmit, page }) {
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState({});
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
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
  const getContent = (lang) => {
    if (lang === "ca") {
      return { titulo: form.titulo, cuerpo: form.cuerpo };
    }
    return translations[lang] || { titulo: "", cuerpo: "" };
  };
  const updateField = (lang, field, value) => {
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    const payload = {
      ...form,
      titulo: form.titulo || "",
      cuerpo: form.cuerpo || "",
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    };
    await onSubmit(payload);
  };
  const handleAutoTranslate = async (targetLang) => {
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
  const handleUploadImage = async (e) => {
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
  const handleUploadDoc = async (e) => {
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
  return _jsx(Dialog, {
    open: open,
    onOpenChange: onOpenChange,
    children: _jsxs(DialogContent, {
      className: "max-w-[720px] px-6",
      children: [
        _jsx(DialogHeader, {
          children: _jsx(DialogTitle, {
            children: page ? "Editar página estática" : "Nueva página estática",
          }),
        }),
        _jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-4",
          children: [
            _jsxs("div", {
              className: "grid gap-4 md:grid-cols-2",
              children: [
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, { htmlFor: "slug", children: "Slug" }),
                    _jsx(Input, {
                      id: "slug",
                      value: form.slug,
                      onChange: (e) =>
                        setForm((prev) => ({ ...prev, slug: e.target.value })),
                      required: true,
                      disabled: !!page,
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, { htmlFor: "template", children: "Plantilla" }),
                    _jsx("select", {
                      id: "template",
                      value: form.template,
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          template: e.target.value,
                        })),
                      disabled: !!page,
                      className:
                        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      children: TEMPLATE_OPTIONS.map((opt) =>
                        _jsxs(
                          "option",
                          {
                            value: opt.value,
                            children: [opt.label, " (", opt.value, ")"],
                          },
                          opt.value,
                        ),
                      ),
                    }),
                    _jsx("p", {
                      className: "text-xs text-muted-foreground",
                      children:
                        "Cada plantilla es \u00FAnica. No se puede cambiar al editar para evitar duplicados.",
                    }),
                  ],
                }),
              ],
            }),
            _jsx("div", {
              className: "grid gap-4 md:grid-cols-2",
              children: _jsxs("div", {
                className:
                  "flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm",
                children: [
                  _jsx(Label, {
                    htmlFor: "static-page-is-published",
                    className: "cursor-pointer text-sm font-normal",
                    children: "Publicado",
                  }),
                  _jsx(Switch, {
                    id: "static-page-is-published",
                    checked: !!form.is_published,
                    onCheckedChange: (checked) =>
                      setForm((prev) => ({ ...prev, is_published: checked })),
                  }),
                ],
              }),
            }),
            _jsxs(Tabs, {
              value: activeLang,
              onValueChange: setActiveLang,
              defaultValue: "ca",
              children: [
                _jsx(TabsList, {
                  className: "grid w-full grid-cols-4",
                  children: LANGUAGES.map((lang) =>
                    _jsx(
                      TabsTrigger,
                      { value: lang.code, children: lang.name },
                      lang.code,
                    ),
                  ),
                }),
                LANGUAGES.map((lang) => {
                  const content = getContent(lang.code);
                  const isBase = lang.code === "ca";
                  return _jsxs(
                    TabsContent,
                    {
                      value: lang.code,
                      className: "space-y-3 pt-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            _jsxs(Label, {
                              htmlFor: `titulo-${lang.code}`,
                              children: [
                                "T\u00EDtulo ",
                                isBase ? "" : `(${lang.name})`,
                              ],
                            }),
                            !isBase &&
                              page &&
                              _jsx(Button, {
                                type: "button",
                                size: "sm",
                                variant: "outline",
                                onClick: () => handleAutoTranslate(lang.code),
                                disabled: loadingTranslate || !form.titulo,
                                children: loadingTranslate
                                  ? "Traduciendo..."
                                  : "Traducir IA",
                              }),
                          ],
                        }),
                        _jsx(Input, {
                          id: `titulo-${lang.code}`,
                          value: content.titulo || "",
                          onChange: (e) =>
                            updateField(lang.code, "titulo", e.target.value),
                          required: isBase,
                          placeholder: isBase
                            ? ""
                            : "Traducción automática o manual",
                        }),
                        _jsxs("div", {
                          className: "space-y-2",
                          children: [
                            _jsxs(Label, {
                              htmlFor: `cuerpo-${lang.code}`,
                              children: [
                                "Cuerpo ",
                                isBase ? "" : `(${lang.name})`,
                              ],
                            }),
                            _jsx(RichTextEditor, {
                              value: content.cuerpo || "",
                              onChange: (val) =>
                                updateField(lang.code, "cuerpo", val),
                              placeholder: isBase
                                ? "Contenido"
                                : "Traducción automática o manual",
                            }),
                          ],
                        }),
                      ],
                    },
                    lang.code,
                  );
                }),
              ],
            }),
            _jsxs("div", {
              className:
                "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3",
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("p", {
                          className: "text-sm font-semibold text-foreground",
                          children: "Imagen destacada",
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children: "Se usar\u00E1 como hero o banner",
                        }),
                      ],
                    }),
                    _jsxs("div", {
                      className: "flex gap-2",
                      children: [
                        _jsx("input", {
                          type: "file",
                          accept: "image/*",
                          ref: imageInputRef,
                          onChange: handleUploadImage,
                          className: "hidden",
                        }),
                        _jsx(Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          onClick: () => imageInputRef.current?.click(),
                          children: "Subir",
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs("select", {
                  value: form.featured_media_id ?? "",
                  onChange: (e) =>
                    setForm((prev) => ({
                      ...prev,
                      featured_media_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })),
                  className:
                    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  children: [
                    _jsx("option", { value: "", children: "Sin imagen" }),
                    images.map((img) =>
                      _jsx(
                        "option",
                        { value: img.id, children: img.original_name },
                        img.id,
                      ),
                    ),
                  ],
                }),
                selectedImage &&
                  _jsxs("div", {
                    className:
                      "flex items-center gap-3 rounded-md bg-background/60 p-2",
                    children: [
                      _jsx("img", {
                        src:
                          selectedImage.thumbnail_url ||
                          selectedImage.variant_thumbnail ||
                          selectedImage.file,
                        alt: "Miniatura",
                        className:
                          "h-14 w-14 rounded object-cover ring-1 ring-border",
                      }),
                      _jsx("p", {
                        className: "text-sm text-foreground",
                        children: selectedImage.original_name,
                      }),
                      _jsx(Button, {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        className: "ml-auto text-rose-600",
                        onClick: () =>
                          setForm((prev) => ({
                            ...prev,
                            featured_media_id: null,
                          })),
                        children: "Quitar",
                      }),
                    ],
                  }),
              ],
            }),
            _jsxs("div", {
              className:
                "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3",
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("p", {
                          className: "text-sm font-semibold text-foreground",
                          children: "Documento adjunto",
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children: "PDF informativo o legal",
                        }),
                      ],
                    }),
                    _jsxs("div", {
                      className: "flex gap-2",
                      children: [
                        _jsx("input", {
                          type: "file",
                          accept: ".pdf,.ics,.txt,.docx,.xlsx",
                          ref: docInputRef,
                          onChange: handleUploadDoc,
                          className: "hidden",
                        }),
                        _jsx(Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          onClick: () => docInputRef.current?.click(),
                          children: "Subir",
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs("select", {
                  value: form.attachment_id ?? "",
                  onChange: (e) =>
                    setForm((prev) => ({
                      ...prev,
                      attachment_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })),
                  className:
                    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  children: [
                    _jsx("option", { value: "", children: "Sin documento" }),
                    documents.map((doc) =>
                      _jsx(
                        "option",
                        { value: doc.id, children: doc.original_name },
                        doc.id,
                      ),
                    ),
                  ],
                }),
                selectedDocument &&
                  _jsxs("div", {
                    className:
                      "flex items-center justify-between rounded-md bg-background/60 px-2 py-1 text-sm",
                    children: [
                      _jsx("span", {
                        children: selectedDocument.original_name,
                      }),
                      _jsx(Button, {
                        type: "button",
                        size: "sm",
                        variant: "ghost",
                        className: "text-rose-600",
                        onClick: () =>
                          setForm((prev) => ({ ...prev, attachment_id: null })),
                        children: "Quitar",
                      }),
                    ],
                  }),
              ],
            }),
            _jsxs("div", {
              className: "flex justify-end gap-2",
              children: [
                _jsx(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: () => onOpenChange(false),
                  children: "Cancelar",
                }),
                _jsx(Button, {
                  type: "submit",
                  children: page ? "Guardar" : "Crear",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
