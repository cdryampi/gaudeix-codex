import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Languages, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MultiSelectHint } from "@/components/common/MultiSelectHint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { tagsApi } from "@/features/tags/api/tags";
import { LANGUAGES } from "@/lib/config/constants";
import { llmApi } from "../api/llm";
import { TranslationDialog } from "./TranslationDialog";
const emptyForm = {
  title: "",
  summary: "",
  description: "",
  start_at: "",
  end_at: "",
  is_published: true,
  venue_name: "",
  location_text: "",
  is_featured: false,
  is_free: true,
  price: null,
  price_text: "",
  category_id: null,
  featured_media_id: null,
  attachments_ids: [],
  tag_ids: [],
  translations: {},
};
export function EventDialog({ open, onOpenChange, onSubmit, event }) {
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        summary: event.summary || "",
        description: event.description || "",
        start_at: toDatetimeLocal(event.start_at),
        end_at: event.end_at ? toDatetimeLocal(event.end_at) : "",
        is_published: event.is_published,
        venue_name: event.venue_name || "",
        location_text: event.location_text || "",
        is_featured: !!event.is_featured,
        is_free: event.is_free ?? true,
        price: event.price ?? null,
        price_text: event.price_text || "",
        category_id: event.category ?? null,
        featured_media_id: event.featured_media?.id ?? null,
        attachments_ids: (event.attachments || []).map((a) => a.id),
        tag_ids: (event.tags || []).map((t) => t.id),
      });
      setTranslations(event.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
      setActiveLang("ca");
    }
  }, [event?.id, open]);
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs, cats, tagsList] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          categoriesApi.list({ taxonomy: "events" }),
          tagsApi.list(),
        ]);
        setImages(imgs);
        setDocuments(docs);
        setCategories(cats);
        setTags(tagsList);
      } catch (err) {
        console.error("Error cargando opciones", err);
        toast.error("No se pudieron cargar las opciones del formulario", {
          description:
            "Por favor, revisa tu conexión o intenta iniciar sesión de nuevo.",
        });
      }
    };
    if (open) loadOptions();
  }, [open]);
  const selectedTagIds = form.tag_ids ?? [];
  const selectedTags = useMemo(() => {
    const selected = new Set(selectedTagIds);
    return tags.filter((tag) => selected.has(tag.id));
  }, [selectedTagIds, tags]);
  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) =>
      (a.nombre || a.slug).localeCompare(b.nombre || b.slug, undefined, {
        sensitivity: "base",
      }),
    );
  }, [tags]);
  const getContent = (lang) => {
    if (lang === "ca") {
      return {
        title: form.title,
        summary: form.summary,
        description: form.description,
      };
    }
    return translations[lang] || { title: "", summary: "", description: "" };
  };
  const updateTranslatedField = (lang, field, value) => {
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
  const handleAutoTranslate = async (targetLang) => {
    if (!event) return;
    if (!form.title) {
      toast.error("No hay títol en el idioma base para traducir");
      return;
    }
    setTranslating(true);
    try {
      const response = await llmApi.autoTranslateEvent(String(event.id));
      if (response.success && response.translations[targetLang]) {
        setTranslations((prev) => ({
          ...prev,
          [targetLang]: {
            ...(prev[targetLang] || {}),
            ...response.translations[targetLang],
          },
        }));
        toast.success(`Traducido a ${targetLang.toUpperCase()}`);
      } else {
        toast.error("Error al traducir", {
          description: response.errors?.[targetLang] || "Error desconocido",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con el servicio de traducción");
    } finally {
      setTranslating(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    onSubmit({
      ...form,
      start_at: toIso(form.start_at),
      end_at: form.end_at ? toIso(form.end_at) : null,
      price_text: form.is_free ? "" : form.price_text,
      attachments_ids: form.attachments_ids ?? [],
      tag_ids: form.tag_ids ?? [],
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    });
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
      setDocuments((prev) => [uploaded, ...prev]);
      setForm((prev) => ({
        ...prev,
        attachments_ids: Array.from(
          new Set([...(prev.attachments_ids ?? []), uploaded.id]),
        ),
      }));
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
  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === form.category_id),
    [categories, form.category_id],
  );
  const attachmentIds = form.attachments_ids ?? [];
  return _jsx(Dialog, {
    open: open,
    onOpenChange: onOpenChange,
    children: _jsxs(DialogContent, {
      className: "max-w-[860px] px-6",
      children: [
        _jsx(DialogHeader, {
          children: _jsx(DialogTitle, {
            children: event ? "Editar evento" : "Nuevo evento",
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
                    _jsx(Label, {
                      htmlFor: "venue_name",
                      children: "Lugar / Organizador",
                    }),
                    _jsx(Input, {
                      id: "venue_name",
                      value: form.venue_name || "",
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          venue_name: e.target.value,
                        })),
                      placeholder: "Nombre del lugar o entidad",
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, {
                      htmlFor: "location_text",
                      children: "Ubicaci\u00F3n",
                    }),
                    _jsx(Input, {
                      id: "location_text",
                      value: form.location_text || "",
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          location_text: e.target.value,
                        })),
                      placeholder: "Descripci\u00F3n o direcci\u00F3n",
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "grid gap-4 md:grid-cols-2",
              children: [
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, { htmlFor: "start_at", children: "Inicio" }),
                    _jsx(Input, {
                      id: "start_at",
                      type: "datetime-local",
                      value: form.start_at,
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          start_at: e.target.value,
                        })),
                      required: true,
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, {
                      htmlFor: "end_at",
                      children: "Fin (opcional)",
                    }),
                    _jsx(Input, {
                      id: "end_at",
                      type: "datetime-local",
                      value: form.end_at || "",
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          end_at: e.target.value,
                        })),
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "grid gap-4 md:grid-cols-2",
              children: [
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, {
                      htmlFor: "category_id",
                      children: "Categor\u00EDa",
                    }),
                    _jsxs(Select, {
                      value: form.category_id ? String(form.category_id) : "",
                      onValueChange: (val) =>
                        setForm((prev) => ({
                          ...prev,
                          category_id: val ? Number(val) : null,
                        })),
                      children: [
                        _jsx(SelectTrigger, {
                          id: "category_id",
                          children: _jsx(SelectValue, {
                            placeholder: "Selecciona una categor\u00EDa",
                            children: selectedCategory?.nombre,
                          }),
                        }),
                        _jsxs(SelectContent, {
                          children: [
                            _jsx(SelectItem, {
                              value: "",
                              children: "Por defecto",
                            }),
                            categories.map((cat) =>
                              _jsx(
                                SelectItem,
                                { value: String(cat.id), children: cat.nombre },
                                cat.id,
                              ),
                            ),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, { htmlFor: "tag_ids", children: "Etiquetas" }),
                    _jsx(MultiSelectHint, {}),
                    _jsx("select", {
                      id: "tag_ids",
                      multiple: true,
                      value: (form.tag_ids ?? []).map(String),
                      onChange: (e) => {
                        const values = Array.from(e.target.selectedOptions).map(
                          (opt) => Number(opt.value),
                        );
                        setForm((prev) => ({ ...prev, tag_ids: values }));
                      },
                      className:
                        "h-24 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      children: sortedTags.map((tag) =>
                        _jsxs(
                          "option",
                          {
                            value: tag.id,
                            children: [tag.nombre, " (", tag.slug, ")"],
                          },
                          tag.id,
                        ),
                      ),
                    }),
                    selectedTags.length > 0 &&
                      _jsx("div", {
                        className: "flex flex-wrap gap-1 pt-1",
                        children: selectedTags.map((tag) =>
                          _jsxs(
                            Badge,
                            {
                              variant: "outline",
                              className:
                                "border-primary/20 bg-primary/10 text-primary",
                              children: [
                                _jsx("span", { children: tag.nombre }),
                                _jsx("button", {
                                  type: "button",
                                  className:
                                    "ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-primary/15",
                                  "aria-label": `Quitar etiqueta ${tag.nombre}`,
                                  onClick: () =>
                                    setForm((prev) => ({
                                      ...prev,
                                      tag_ids: (prev.tag_ids ?? []).filter(
                                        (id) => id !== tag.id,
                                      ),
                                    })),
                                  children: _jsx(X, { className: "h-3 w-3" }),
                                }),
                              ],
                            },
                            tag.id,
                          ),
                        ),
                      }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "grid gap-4 md:grid-cols-3",
              children: [
                _jsxs("div", {
                  role: "button",
                  tabIndex: 0,
                  onClick: () =>
                    setForm((prev) => ({
                      ...prev,
                      is_published: !prev.is_published,
                    })),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setForm((prev) => ({
                        ...prev,
                        is_published: !prev.is_published,
                      }));
                    }
                  },
                  className: `flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    form.is_published
                      ? "border-primary-200 bg-primary-50/50 dark:border-primary-900/50 dark:bg-primary-900/20"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
                  }`,
                  children: [
                    _jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        _jsx("span", {
                          className: `text-sm font-bold uppercase tracking-wider ${
                            form.is_published
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`,
                          children: "Publicado",
                        }),
                        _jsx("div", {
                          onClick: (e) => e.stopPropagation(),
                          children: _jsx(Switch, {
                            id: "event-is-published",
                            checked: form.is_published,
                            onCheckedChange: (checked) =>
                              setForm((prev) => ({
                                ...prev,
                                is_published: checked,
                              })),
                          }),
                        }),
                      ],
                    }),
                    _jsx("p", {
                      className:
                        "text-xs leading-relaxed text-gray-500 dark:text-gray-400",
                      children: form.is_published
                        ? "Visible para todos los usuarios en la web."
                        : "Borrador: solo visible en el panel de control.",
                    }),
                  ],
                }),
                _jsxs("div", {
                  role: "button",
                  tabIndex: 0,
                  onClick: () =>
                    setForm((prev) => ({
                      ...prev,
                      is_featured: !prev.is_featured,
                    })),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setForm((prev) => ({
                        ...prev,
                        is_featured: !prev.is_featured,
                      }));
                    }
                  },
                  className: `flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    form.is_featured
                      ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-900/20"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
                  }`,
                  children: [
                    _jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        _jsx("span", {
                          className: `text-sm font-bold uppercase tracking-wider ${
                            form.is_featured
                              ? "text-amber-700 dark:text-amber-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`,
                          children: "Destacado",
                        }),
                        _jsx("div", {
                          onClick: (e) => e.stopPropagation(),
                          children: _jsx(Switch, {
                            id: "event-is-featured",
                            checked: form.is_featured,
                            onCheckedChange: (checked) =>
                              setForm((prev) => ({
                                ...prev,
                                is_featured: checked,
                              })),
                          }),
                        }),
                      ],
                    }),
                    _jsx("p", {
                      className:
                        "text-xs leading-relaxed text-gray-500 dark:text-gray-400",
                      children: form.is_featured
                        ? "Aparecerá en posiciones prioritarias de la home."
                        : "Posicionamiento estándar en los listados.",
                    }),
                  ],
                }),
                _jsxs("div", {
                  role: "button",
                  tabIndex: 0,
                  onClick: () =>
                    setForm((prev) => {
                      const checked = !prev.is_free;
                      return {
                        ...prev,
                        is_free: checked,
                        price: checked ? null : prev.price,
                        price_text: checked ? "" : prev.price_text,
                      };
                    }),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setForm((prev) => {
                        const checked = !prev.is_free;
                        return {
                          ...prev,
                          is_free: checked,
                          price: checked ? null : prev.price,
                          price_text: checked ? "" : prev.price_text,
                        };
                      });
                    }
                  },
                  className: `flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    form.is_free
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/20"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
                  }`,
                  children: [
                    _jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        _jsx("span", {
                          className: `text-sm font-bold uppercase tracking-wider ${
                            form.is_free
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`,
                          children: "Gratuito",
                        }),
                        _jsx("div", {
                          onClick: (e) => e.stopPropagation(),
                          children: _jsx(Switch, {
                            id: "event-is-free",
                            checked: form.is_free ?? true,
                            onCheckedChange: (checked) =>
                              setForm((prev) => ({
                                ...prev,
                                is_free: checked,
                                price: checked ? null : prev.price,
                                price_text: checked ? "" : prev.price_text,
                              })),
                          }),
                        }),
                      ],
                    }),
                    _jsx("p", {
                      className:
                        "text-xs leading-relaxed text-gray-500 dark:text-gray-400",
                      children: form.is_free
                        ? "Sin coste de entrada. Oculta campos de precio."
                        : "Evento de pago. Requiere definir precio o texto.",
                    }),
                  ],
                }),
              ],
            }),
            !form.is_free &&
              _jsxs("div", {
                className:
                  "grid animate-in fade-in slide-in-from-top-2 gap-4 duration-300 md:grid-cols-2",
                children: [
                  _jsxs("div", {
                    className: "space-y-2",
                    children: [
                      _jsx(Label, {
                        htmlFor: "price",
                        className: "text-sm font-semibold",
                        children: "Precio (Decimal)",
                      }),
                      _jsxs("div", {
                        className: "relative",
                        children: [
                          _jsx(Input, {
                            id: "price",
                            type: "number",
                            step: "0.01",
                            value: form.price !== null ? form.price : "",
                            onChange: (e) =>
                              setForm((prev) => ({
                                ...prev,
                                price:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              })),
                            placeholder: "0.00",
                            className: "bg-white pr-8 dark:bg-gray-800",
                          }),
                          _jsx("div", {
                            className:
                              "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
                            children: _jsx("span", {
                              className: "text-sm font-medium text-gray-500",
                              children: "\u20AC",
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "space-y-2",
                    children: [
                      _jsx(Label, {
                        htmlFor: "price_text",
                        className: "text-sm font-semibold",
                        children: "Texto de Precio (Opcional)",
                      }),
                      _jsx(Input, {
                        id: "price_text",
                        value: form.price_text || "",
                        onChange: (e) =>
                          setForm((prev) => ({
                            ...prev,
                            price_text: e.target.value,
                          })),
                        placeholder: "Ej: A partir de 5\u20AC...",
                        className: "bg-white dark:bg-gray-800",
                      }),
                    ],
                  }),
                ],
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
                              htmlFor: `title-${lang.code}`,
                              children: [
                                "T\u00EDtulo ",
                                isBase ? "" : `(${lang.name})`,
                              ],
                            }),
                            !isBase &&
                              event &&
                              _jsx(Button, {
                                type: "button",
                                size: "sm",
                                variant: "outline",
                                onClick: () => handleAutoTranslate(lang.code),
                                disabled: translating || !form.title,
                                children: translating
                                  ? _jsxs(_Fragment, {
                                      children: [
                                        _jsx(Loader2, {
                                          className:
                                            "mr-2 h-4 w-4 animate-spin",
                                        }),
                                        "Traduciendo...",
                                      ],
                                    })
                                  : "Traducir IA",
                              }),
                          ],
                        }),
                        _jsx(Input, {
                          id: `title-${lang.code}`,
                          value: content.title || "",
                          onChange: (e) =>
                            updateTranslatedField(
                              lang.code,
                              "title",
                              e.target.value,
                            ),
                          required: isBase,
                          placeholder: isBase
                            ? ""
                            : "Traducción automática o manual",
                        }),
                        _jsxs("div", {
                          className: "space-y-2",
                          children: [
                            _jsxs(Label, {
                              htmlFor: `summary-${lang.code}`,
                              children: [
                                "Resumen ",
                                isBase ? "" : `(${lang.name})`,
                              ],
                            }),
                            _jsx(Textarea, {
                              id: `summary-${lang.code}`,
                              value: content.summary || "",
                              onChange: (e) =>
                                updateTranslatedField(
                                  lang.code,
                                  "summary",
                                  e.target.value,
                                ),
                              placeholder: isBase
                                ? "Resumen breve del evento"
                                : "Traducción automática o manual",
                              className: "min-h-[72px]",
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "space-y-2",
                          children: [
                            _jsxs(Label, {
                              htmlFor: `description-${lang.code}`,
                              children: [
                                "Descripci\u00F3n ",
                                isBase ? "" : `(${lang.name})`,
                              ],
                            }),
                            _jsx(RichTextEditor, {
                              value: content.description || "",
                              onChange: (value) =>
                                updateTranslatedField(
                                  lang.code,
                                  "description",
                                  value,
                                ),
                              placeholder: isBase
                                ? "Describe el evento en detalle..."
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
                "space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3",
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
                          children: "Miniatura visible en listados",
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
                        _jsxs(Select, {
                          value: form.featured_media_id
                            ? String(form.featured_media_id)
                            : "",
                          onValueChange: (val) =>
                            setForm((prev) => ({
                              ...prev,
                              featured_media_id: val ? Number(val) : null,
                            })),
                          children: [
                            _jsx(SelectTrigger, {
                              className: "w-[200px]",
                              children: _jsx(SelectValue, {
                                placeholder: "Seleccionar...",
                                children: selectedImage?.original_name,
                              }),
                            }),
                            _jsxs(SelectContent, {
                              children: [
                                _jsx(SelectItem, {
                                  value: "",
                                  children: "Sin imagen",
                                }),
                                images.map((img) =>
                                  _jsx(
                                    SelectItem,
                                    {
                                      value: String(img.id),
                                      children: img.original_name,
                                    },
                                    img.id,
                                  ),
                                ),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
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
                "space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3",
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("p", {
                          className: "text-sm font-semibold text-foreground",
                          children: "Adjuntos",
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children: "Documentos vinculados al evento",
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
                        _jsx("div", {
                          className: "flex flex-col items-end gap-1",
                          children: _jsxs("div", {
                            className: "flex gap-2",
                            children: [
                              _jsx(Button, {
                                type: "button",
                                variant: "outline",
                                size: "sm",
                                onClick: () => docInputRef.current?.click(),
                                children: "Subir",
                              }),
                              _jsx("select", {
                                multiple: true,
                                value: attachmentIds.map(String),
                                onChange: (e) => {
                                  const values = Array.from(
                                    e.target.selectedOptions,
                                  ).map((opt) => Number(opt.value));
                                  setForm((prev) => ({
                                    ...prev,
                                    attachments_ids: values,
                                  }));
                                },
                                className:
                                  "h-24 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                                children: documents.map((doc) =>
                                  _jsx(
                                    "option",
                                    {
                                      value: doc.id,
                                      children: doc.original_name,
                                    },
                                    doc.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                attachmentIds.length > 0 &&
                  _jsx("div", {
                    className: "space-y-1 text-sm",
                    children: attachmentIds.map((id) => {
                      const doc = documents.find((d) => d.id === id);
                      return _jsxs(
                        "div",
                        {
                          className:
                            "flex items-center justify-between rounded-md bg-background/60 px-2 py-1",
                          children: [
                            _jsx("span", {
                              children: doc?.original_name || `Documento ${id}`,
                            }),
                            _jsx(Button, {
                              type: "button",
                              size: "sm",
                              variant: "ghost",
                              className: "text-rose-600",
                              onClick: () =>
                                setForm((prev) => ({
                                  ...prev,
                                  attachments_ids: (
                                    prev.attachments_ids ?? []
                                  ).filter((docId) => docId !== id),
                                })),
                              children: "Quitar",
                            }),
                          ],
                        },
                        id,
                      );
                    }),
                  }),
              ],
            }),
            _jsxs("div", {
              className: "flex justify-end gap-2",
              children: [
                event &&
                  _jsxs(Button, {
                    type: "button",
                    variant: "outline",
                    onClick: () => setTranslationDialogOpen(true),
                    children: [
                      _jsx(Languages, { className: "mr-2 h-4 w-4" }),
                      "Traducir con IA",
                    ],
                  }),
                _jsx(Button, {
                  type: "submit",
                  children: event ? "Guardar cambios" : "Crear",
                }),
              ],
            }),
          ],
        }),
        event &&
          _jsx(TranslationDialog, {
            open: translationDialogOpen,
            onOpenChange: setTranslationDialogOpen,
            eventId: String(event.id),
            currentTitle: form.title,
            currentDescription: form.description || "",
            onApplyTranslations: (t) => {
              setTranslations((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(t).map(([lang, values]) => [
                    lang,
                    { ...(prev[lang] || {}), ...values },
                  ]),
                ),
              }));
            },
          }),
      ],
    }),
  });
}
function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toISOString().slice(0, 16);
}
function toIso(value) {
  if (!value) return value;
  const date = new Date(value);
  return date.toISOString();
}
