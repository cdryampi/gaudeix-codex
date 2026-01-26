import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LayoutPanelTop,
  Palette,
  Phone,
  Plug,
  Search,
  Share2,
  TriangleAlert,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { siteSettingsApi } from "../api/siteSettings";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
function mapDefaults() {
  return {
    site_name: "",
    tagline: "",
    logo_id: null,
    logo: null,
    logo_file: null,
    logo_dark_id: null,
    logo_dark: null,
    logo_dark_file: null,
    favicon_id: null,
    favicon: null,
    favicon_file: null,
    phone: "",
    support_email: "",
    contact_email: "",
    address: "",
    schedule: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    youtube_url: "",
    video_enabled: true,
    video_title: "",
    video_description_internal: "",
    background_video_id: null,
    maps_base_url: "",
    analytics_id: "",
    captcha_site_key: "",
    show_language_switcher: true,
    show_social_footer: true,
    privacy_page_id: null,
    cookies_page_id: null,
    legal_page_id: null,
    inclusion_page_id: null,
    default_metatitle: "",
    default_metadescription: "",
    default_og_image_id: null,
    default_og_image: null,
  };
}
function getPreviewUrl(image) {
  return image?.thumbnail_url || image?.variant_thumbnail || image?.file || "";
}
export function SiteSettingsPage() {
  const [form, setForm] = useState(mapDefaults());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [staticPages, setStaticPages] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [settings, pages] = await Promise.all([
          siteSettingsApi.get(),
          staticPagesApi.list(),
        ]);
        setStaticPages(pages);
        setForm((prev) => ({
          ...prev,
          ...settings,
          logo_id: settings.logo_id ?? null,
          logo_dark_id: settings.logo_dark_id ?? null,
          favicon_id: settings.favicon_id ?? null,
          privacy_page_id: settings.privacy_page_id ?? null,
          cookies_page_id: settings.cookies_page_id ?? null,
          legal_page_id: settings.legal_page_id ?? null,
          inclusion_page_id: settings.inclusion_page_id ?? null,
          default_og_image_id: settings.default_og_image_id ?? null,
          video_enabled: settings.video_enabled ?? true,
          background_video_id: settings.background_video_id ?? null,
          logo_file: null,
          logo_dark_file: null,
          favicon_file: null,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las configuraciones");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await siteSettingsApi.update(form);
      setForm((prev) => ({
        ...prev,
        ...updated,
        logo_id: updated.logo_id ?? null,
        logo_dark_id: updated.logo_dark_id ?? null,
        favicon_id: updated.favicon_id ?? null,
        default_og_image_id: updated.default_og_image_id ?? null,
        video_enabled: updated.video_enabled ?? true,
        background_video_id: updated.background_video_id ?? null,
        logo_file: null,
        logo_dark_file: null,
        favicon_file: null,
      }));
      toast.success("Configuración guardada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };
  const optionsByTemplate = useMemo(() => {
    const base = (template) =>
      staticPages
        .filter((p) => p.template === template)
        .map((p) => ({ id: p.id, label: `${p.titulo} (${p.template})` }));
    return {
      privacy: base("privacy"),
      cookies: base("cookies"),
      legal_notice: base("legal_notice"),
      inclusion: base("inclusion"),
    };
  }, [staticPages]);
  return _jsxs(PageContainer, {
    children: [
      _jsx(PageHeader, {
        title: "Site settings",
        description:
          "Configura branding, contacto, redes e integraciones p\u00FAblicas.",
      }),
      _jsxs(Alert, {
        variant: "destructive",
        className: "mb-4 w-3/4",
        children: [
          _jsx(TriangleAlert, { className: "h-4 w-4" }),
          _jsx(AlertTitle, { children: "Header/Footer en BETA" }),
          _jsx(AlertDescription, {
            className: "text-sm",
            children:
              "Los enlaces legales y la visualizaci\u00F3n del footer pueden requerir ajustes en frontend. Revisa despu\u00E9s de guardar.",
          }),
        ],
      }),
      _jsx(Card, {
        className: "border-border bg-card",
        children: _jsx(CardContent, {
          className: "p-6",
          children: loading
            ? _jsx("div", {
                className:
                  "flex h-32 items-center justify-center text-muted-foreground",
                children: "Cargando...",
              })
            : error
              ? _jsx("div", { className: "text-destructive", children: error })
              : _jsxs("form", {
                  onSubmit: handleSubmit,
                  className: "space-y-6",
                  children: [
                    _jsxs("section", {
                      className:
                        "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx(Palette, {
                              className: "h-4 w-4 text-muted-foreground",
                            }),
                            _jsx("h3", {
                              className:
                                "text-sm font-semibold text-foreground",
                              children: "Branding",
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "grid gap-4 md:grid-cols-2",
                          children: [
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Nombre del sitio" }),
                                _jsx(Input, {
                                  value: form.site_name,
                                  onChange: (e) =>
                                    handleChange("site_name", e.target.value),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Claim / Tagline" }),
                                _jsx(Input, {
                                  value: form.tagline,
                                  onChange: (e) =>
                                    handleChange("tagline", e.target.value),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Logo (ID)" }),
                                _jsx(Input, {
                                  value: form.logo_id ?? "",
                                  onChange: (e) =>
                                    handleChange(
                                      "logo_id",
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    ),
                                  placeholder: "ID de imagen",
                                }),
                                _jsx("p", {
                                  className: "text-xs text-muted-foreground",
                                  children:
                                    "Solo introduce el ID de la imagen (no se listan todas para evitar cargas masivas).",
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Logo (archivo)" }),
                                _jsx(Input, {
                                  type: "file",
                                  accept: "image/*",
                                  onChange: (e) =>
                                    handleChange(
                                      "logo_file",
                                      e.target.files?.[0] ?? null,
                                    ),
                                }),
                                getPreviewUrl(form.logo)
                                  ? _jsx("img", {
                                      src: getPreviewUrl(form.logo),
                                      alt: "Logo actual",
                                      className:
                                        "h-10 w-auto rounded border border-border/60 bg-background p-1",
                                    })
                                  : null,
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Logo (dark) ID" }),
                                _jsx(Input, {
                                  value: form.logo_dark_id ?? "",
                                  onChange: (e) =>
                                    handleChange(
                                      "logo_dark_id",
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    ),
                                  placeholder: "ID de imagen",
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, {
                                  children: "Logo (dark) archivo",
                                }),
                                _jsx(Input, {
                                  type: "file",
                                  accept: "image/*",
                                  onChange: (e) =>
                                    handleChange(
                                      "logo_dark_file",
                                      e.target.files?.[0] ?? null,
                                    ),
                                }),
                                getPreviewUrl(form.logo_dark)
                                  ? _jsx("img", {
                                      src: getPreviewUrl(form.logo_dark),
                                      alt: "Logo dark actual",
                                      className:
                                        "h-10 w-auto rounded border border-border/60 bg-background p-1",
                                    })
                                  : null,
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Favicon (ID)" }),
                                _jsx(Input, {
                                  value: form.favicon_id ?? "",
                                  onChange: (e) =>
                                    handleChange(
                                      "favicon_id",
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    ),
                                  placeholder: "ID de imagen",
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Favicon (archivo)" }),
                                _jsx(Input, {
                                  type: "file",
                                  accept: "image/*",
                                  onChange: (e) =>
                                    handleChange(
                                      "favicon_file",
                                      e.target.files?.[0] ?? null,
                                    ),
                                }),
                                getPreviewUrl(form.favicon)
                                  ? _jsx("img", {
                                      src: getPreviewUrl(form.favicon),
                                      alt: "Favicon actual",
                                      className:
                                        "h-8 w-8 rounded border border-border/60 bg-background p-1",
                                    })
                                  : null,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsxs("section", {
                      className:
                        "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx(Phone, {
                              className: "h-4 w-4 text-muted-foreground",
                            }),
                            _jsx("h3", {
                              className:
                                "text-sm font-semibold text-foreground",
                              children: "Contacto",
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "grid gap-4 md:grid-cols-2",
                          children: [
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Tel\u00E9fono" }),
                                _jsx(Input, {
                                  value: form.phone,
                                  onChange: (e) =>
                                    handleChange("phone", e.target.value),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Email soporte" }),
                                _jsx(Input, {
                                  value: form.support_email,
                                  onChange: (e) =>
                                    handleChange(
                                      "support_email",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Email contacto" }),
                                _jsx(Input, {
                                  value: form.contact_email,
                                  onChange: (e) =>
                                    handleChange(
                                      "contact_email",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Direcci\u00F3n" }),
                                _jsx(Input, {
                                  value: form.address,
                                  onChange: (e) =>
                                    handleChange("address", e.target.value),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2 md:col-span-2",
                              children: [
                                _jsx(Label, { children: "Horario" }),
                                _jsx(Input, {
                                  value: form.schedule,
                                  onChange: (e) =>
                                    handleChange("schedule", e.target.value),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsxs("section", {
                      className:
                        "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx(Share2, {
                              className: "h-4 w-4 text-muted-foreground",
                            }),
                            _jsx("h3", {
                              className:
                                "text-sm font-semibold text-foreground",
                              children: "Redes sociales",
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "grid gap-4 md:grid-cols-2",
                          children: [
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Facebook" }),
                                _jsx(Input, {
                                  value: form.facebook_url,
                                  onChange: (e) =>
                                    handleChange(
                                      "facebook_url",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Instagram" }),
                                _jsx(Input, {
                                  value: form.instagram_url,
                                  onChange: (e) =>
                                    handleChange(
                                      "instagram_url",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Twitter/X" }),
                                _jsx(Input, {
                                  value: form.twitter_url,
                                  onChange: (e) =>
                                    handleChange("twitter_url", e.target.value),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "YouTube" }),
                                _jsx(Input, {
                                  value: form.youtube_url,
                                  onChange: (e) =>
                                    handleChange("youtube_url", e.target.value),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsxs("section", {
                      className:
                        "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx(Plug, {
                              className: "h-4 w-4 text-muted-foreground",
                            }),
                            _jsx("h3", {
                              className:
                                "text-sm font-semibold text-foreground",
                              children: "Integraciones p\u00FAblicas",
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "grid gap-4 md:grid-cols-2",
                          children: [
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Maps base URL" }),
                                _jsx(Input, {
                                  value: form.maps_base_url,
                                  onChange: (e) =>
                                    handleChange(
                                      "maps_base_url",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Analytics ID" }),
                                _jsx(Input, {
                                  value: form.analytics_id,
                                  onChange: (e) =>
                                    handleChange(
                                      "analytics_id",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Captcha site key" }),
                                _jsx(Input, {
                                  value: form.captcha_site_key,
                                  onChange: (e) =>
                                    handleChange(
                                      "captcha_site_key",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsxs("section", {
                      className:
                        "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx(Video, {
                              className: "h-4 w-4 text-muted-foreground",
                            }),
                            _jsx("h3", {
                              className:
                                "text-sm font-semibold text-foreground",
                              children: "V\u00EDdeo hero",
                            }),
                          ],
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children:
                            "Usa un v\u00EDdeo propio (ID) o un enlace de YouTube. El v\u00EDdeo interno se reproduce sin sonido como fondo.",
                        }),
                        _jsxs("div", {
                          className: "grid gap-4 md:grid-cols-2",
                          children: [
                            _jsxs("label", {
                              className:
                                "flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm md:col-span-2",
                              children: [
                                _jsx("span", {
                                  children:
                                    "Activar v\u00EDdeo de fondo (hero)",
                                }),
                                _jsx(Switch, {
                                  checked: !!form.video_enabled,
                                  onCheckedChange: (checked) =>
                                    handleChange("video_enabled", checked),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Video ID (interno)" }),
                                _jsx(Input, {
                                  value: form.background_video_id ?? "",
                                  onChange: (e) =>
                                    handleChange(
                                      "background_video_id",
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    ),
                                  placeholder: "ID de VideoFile",
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Youtube URL" }),
                                _jsx(Input, {
                                  value: form.youtube_url || "",
                                  onChange: (e) =>
                                    handleChange("youtube_url", e.target.value),
                                  placeholder:
                                    "https://www.youtube.com/watch?v=...",
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, {
                                  children: "T\u00EDtulo interno",
                                }),
                                _jsx(Input, {
                                  value: form.video_title || "",
                                  onChange: (e) =>
                                    handleChange("video_title", e.target.value),
                                  placeholder: "V\u00EDdeo Cabrera de Mar",
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2 md:col-span-2",
                              children: [
                                _jsx(Label, {
                                  children: "Descripci\u00F3n interna",
                                }),
                                _jsx(Textarea, {
                                  value: form.video_description_internal || "",
                                  onChange: (e) =>
                                    handleChange(
                                      "video_description_internal",
                                      e.target.value,
                                    ),
                                  rows: 3,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsxs("section", {
                      className:
                        "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx(LayoutPanelTop, {
                              className: "h-4 w-4 text-muted-foreground",
                            }),
                            _jsx("h3", {
                              className:
                                "text-sm font-semibold text-foreground",
                              children: "Header/Footer (BETA)",
                            }),
                            _jsx(Badge, { children: "Beta" }),
                          ],
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children:
                            "Ajusta con cuidado: estos enlaces se usan en el header/footer p\u00FAblico.",
                        }),
                        _jsxs("div", {
                          className: "grid gap-4 md:grid-cols-2",
                          children: [
                            _jsxs("label", {
                              className:
                                "flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm",
                              children: [
                                _jsx("span", {
                                  children: "Mostrar selector de idioma",
                                }),
                                _jsx(Switch, {
                                  checked: !!form.show_language_switcher,
                                  onCheckedChange: (checked) =>
                                    handleChange(
                                      "show_language_switcher",
                                      checked,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("label", {
                              className:
                                "flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm",
                              children: [
                                _jsx("span", {
                                  children: "Mostrar redes en footer",
                                }),
                                _jsx(Switch, {
                                  checked: !!form.show_social_footer,
                                  onCheckedChange: (checked) =>
                                    handleChange("show_social_footer", checked),
                                }),
                              ],
                            }),
                            (() => {
                              const fieldConfigs = [
                                [
                                  "privacy_page_id",
                                  "Página de privacidad",
                                  optionsByTemplate.privacy,
                                ],
                                [
                                  "cookies_page_id",
                                  "Página de cookies",
                                  optionsByTemplate.cookies,
                                ],
                                [
                                  "legal_page_id",
                                  "Avís legal",
                                  optionsByTemplate.legal_notice,
                                ],
                                [
                                  "inclusion_page_id",
                                  "Diversitat i inclusió",
                                  optionsByTemplate.inclusion,
                                ],
                              ];
                              return fieldConfigs.map(([field, label, opts]) =>
                                _jsxs(
                                  "div",
                                  {
                                    className: "space-y-2",
                                    children: [
                                      _jsx(Label, { children: label }),
                                      _jsxs("select", {
                                        value: form[field] ?? "",
                                        onChange: (e) =>
                                          handleChange(
                                            field,
                                            e.target.value
                                              ? Number(e.target.value)
                                              : null,
                                          ),
                                        className:
                                          "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                                        children: [
                                          _jsx("option", {
                                            value: "",
                                            children: "Sin asignar",
                                          }),
                                          opts.map((opt) =>
                                            _jsx(
                                              "option",
                                              {
                                                value: opt.id,
                                                children: opt.label,
                                              },
                                              opt.id,
                                            ),
                                          ),
                                        ],
                                      }),
                                    ],
                                  },
                                  field,
                                ),
                              );
                            })(),
                          ],
                        }),
                      ],
                    }),
                    _jsxs("section", {
                      className:
                        "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            _jsx(Search, {
                              className: "h-4 w-4 text-muted-foreground",
                            }),
                            _jsx("h3", {
                              className:
                                "text-sm font-semibold text-foreground",
                              children: "SEO por defecto",
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: "grid gap-4 md:grid-cols-2",
                          children: [
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, { children: "Metat\u00EDtulo" }),
                                _jsx(Input, {
                                  value: form.default_metatitle,
                                  onChange: (e) =>
                                    handleChange(
                                      "default_metatitle",
                                      e.target.value,
                                    ),
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, {
                                  children: "Metadescripci\u00F3n",
                                }),
                                _jsx(Textarea, {
                                  value: form.default_metadescription,
                                  onChange: (e) =>
                                    handleChange(
                                      "default_metadescription",
                                      e.target.value,
                                    ),
                                  rows: 3,
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "space-y-2",
                              children: [
                                _jsx(Label, {
                                  children: "Imagen OG por defecto (ID)",
                                }),
                                _jsx(Input, {
                                  value: form.default_og_image_id ?? "",
                                  onChange: (e) =>
                                    handleChange(
                                      "default_og_image_id",
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    ),
                                  placeholder: "ID de imagen",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    _jsx("div", {
                      className: "flex justify-end",
                      children: _jsx(Button, {
                        type: "submit",
                        disabled: saving,
                        children: saving ? "Guardando..." : "Guardar cambios",
                      }),
                    }),
                  ],
                }),
        }),
      }),
    ],
  });
}
