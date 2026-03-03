import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Phone,
  Plug,
  Search,
  Share2,
  Video,
  Image as ImageIcon,
  LayoutPanelTop,
  BellRing,
  CloudSun,
} from "lucide-react";
import { siteSettingsApi } from "../api/siteSettings";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { StaticPage } from "@/features/static-pages/types";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ImageSelector } from "@/features/media/components/ImageSelector";
import { VideoSelector } from "@/features/media/components/VideoSelector";
import { MediaItem } from "@/features/media/types";

type FormState = ReturnType<typeof mapDefaults>;

function mapDefaults() {
  return {
    site_name: "",
    tagline: "",
    logo_id: null as number | null,
    logo_dark_id: null as number | null,
    favicon_id: null as number | null,
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
    background_video_id: null as number | null,
    maps_base_url: "",
    analytics_id: "",
    captcha_site_key: "",
    show_language_switcher: true,
    show_social_footer: true,
    privacy_page_id: null as number | null,
    cookies_page_id: null as number | null,
    legal_page_id: null as number | null,
    inclusion_page_id: null as number | null,
    default_metatitle: "",
    default_metadescription: "",
    default_og_image_id: null as number | null,
    google_weather_api_key: "",
    alert_enabled: false,
    alert_message: "",
    alert_type: "info" as "info" | "success" | "warning" | "danger",
    alert_link: "",
    alert_start_at: null as string | null,
    alert_end_at: null as string | null,
  };
}

export function SiteSettingsPage() {
  const [form, setForm] = useState<FormState>(mapDefaults());
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);

  const [activeImageField, setActiveImageField] = useState<
    keyof FormState | null
  >(null);
  const [videoSelectorOpen, setVideoSelectorOpen] = useState(false);

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
          logo_id: settings.logo?.id ?? null,
          logo_dark_id: settings.logo_dark?.id ?? null,
          favicon_id: settings.favicon?.id ?? null,
          privacy_page_id: settings.privacy_page_id ?? null,
          cookies_page_id: settings.cookies_page_id ?? null,
          legal_page_id: settings.legal_page_id ?? null,
          inclusion_page_id: settings.inclusion_page_id ?? null,
          default_og_image_id: settings.default_og_image?.id ?? null,
          video_enabled: settings.video_enabled ?? true,
          background_video_id: settings.background_video?.id ?? null,
        }));

        setPreviews({
          logo_id: settings.logo?.file ?? null,
          logo_dark_id: settings.logo_dark?.file ?? null,
          favicon_id: settings.favicon?.file ?? null,
          default_og_image_id: settings.default_og_image?.file ?? null,
          background_video_id: settings.background_video?.file ?? null,
        });
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las configuraciones");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (
    field: keyof FormState,
    value: FormState[keyof FormState],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (image: MediaItem) => {
    if (!activeImageField) return;
    handleChange(activeImageField, image.id);
    setPreviews((prev) => ({ ...prev, [activeImageField]: image.file }));
    setActiveImageField(null);
  };

  const handleVideoSelect = (video: MediaItem) => {
    handleChange("background_video_id", video.id);
    setPreviews((prev) => ({ ...prev, background_video_id: video.file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await siteSettingsApi.update(form);
      toast.success("Configuración guardada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const optionsByTemplate = useMemo(() => {
    const base = (template: string) =>
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

  const ImageField = ({
    label,
    field,
  }: {
    label: string;
    field: keyof FormState;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setActiveImageField(field)}
        >
          {previews[field] ? (
            <img
              src={previews[field]!}
              alt={label}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveImageField(field)}
          >
            Seleccionar
          </Button>
          {form[field] && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-auto py-1"
              onClick={() => {
                handleChange(field, null);
                setPreviews((prev) => ({ ...prev, [field]: null }));
              }}
            >
              Quitar
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Site settings"
        description="Configura branding, contacto, redes e integraciones públicas."
      />

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Cargando...
            </div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* BRANDING */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Branding</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nombre del sitio</Label>
                    <Input
                      value={form.site_name}
                      onChange={(e) =>
                        handleChange("site_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={form.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                    />
                  </div>

                  <ImageField label="Logotipo Principal" field="logo_id" />
                  <ImageField label="Logotipo Oscuro" field="logo_dark_id" />
                  <ImageField
                    label="Icono del Sitio (Favicon)"
                    field="favicon_id"
                  />
                </div>
              </section>

              {/* CONTACTO */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Contacto</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email soporte</Label>
                    <Input
                      value={form.support_email}
                      onChange={(e) =>
                        handleChange("support_email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email contacto</Label>
                    <Input
                      value={form.contact_email}
                      onChange={(e) =>
                        handleChange("contact_email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Horario</Label>
                    <Input
                      value={form.schedule}
                      onChange={(e) => handleChange("schedule", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* REDES SOCIALES */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Redes Sociales</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input
                      value={form.facebook_url}
                      onChange={(e) =>
                        handleChange("facebook_url", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={form.instagram_url}
                      onChange={(e) =>
                        handleChange("instagram_url", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter/X</Label>
                    <Input
                      value={form.twitter_url}
                      onChange={(e) =>
                        handleChange("twitter_url", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input
                      value={form.youtube_url}
                      onChange={(e) =>
                        handleChange("youtube_url", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <BellRing className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">
                    Avisos Globales / Emergencias
                  </h3>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 space-y-6">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold">
                        Activar Aviso Global
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Muestra una barra de alerta en toda la web.
                      </p>
                    </div>
                    <Switch
                      checked={!!form.alert_enabled}
                      onCheckedChange={(checked) =>
                        handleChange("alert_enabled", checked)
                      }
                    />
                  </div>

                  {form.alert_enabled && (
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label>Mensaje del aviso</Label>
                        <Textarea
                          value={form.alert_message}
                          onChange={(e) =>
                            handleChange("alert_message", e.target.value)
                          }
                          placeholder="Escribe el mensaje urgente..."
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Tipo de aviso</Label>
                          <select
                            value={form.alert_type}
                            onChange={(e) =>
                              handleChange("alert_type", e.target.value)
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="info">Información (Azul)</option>
                            <option value="success">Éxito (Verde)</option>
                            <option value="warning">
                              Advertencia (Naranja)
                            </option>
                            <option value="danger">
                              Urgente/Peligro (Rojo)
                            </option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Enlace 'Saber más' (Opcional)</Label>
                          <Input
                            value={form.alert_link}
                            onChange={(e) =>
                              handleChange("alert_link", e.target.value)
                            }
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha Inicio</Label>
                          <Input
                            type="datetime-local"
                            value={
                              form.alert_start_at
                                ? form.alert_start_at.slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              handleChange("alert_start_at", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha Fin</Label>
                          <Input
                            type="datetime-local"
                            value={
                              form.alert_end_at
                                ? form.alert_end_at.slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              handleChange("alert_end_at", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* VIDEO HERO */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Video className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Vídeo Hero</h3>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 space-y-6">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold">
                        Activar Vídeo
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Se mostrará en el fondo de la portada (Hero)
                      </p>
                    </div>
                    <Switch
                      checked={!!form.video_enabled}
                      onCheckedChange={(checked) =>
                        handleChange("video_enabled", checked)
                      }
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {form.video_enabled && (
                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden relative group border border-border">
                        {previews.background_video_id ? (
                          <video
                            src={previews.background_video_id}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Video className="h-10 w-10 mb-2 opacity-50" />
                            <span className="text-xs">
                              Sin vídeo seleccionado
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setVideoSelectorOpen(true)}
                          >
                            Cambiar Vídeo
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Título (Accesibilidad)</Label>
                          <Input
                            value={form.video_title}
                            onChange={(e) =>
                              handleChange("video_title", e.target.value)
                            }
                            placeholder="Descripción del vídeo..."
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setVideoSelectorOpen(true)}
                        >
                          Seleccionar de la librería
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Se recomienda formato MP4, sin audio y tamaño menor a
                          10MB.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* INTEGRACIONES */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Plug className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Integraciones</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Maps URL</Label>
                    <Input
                      value={form.maps_base_url}
                      onChange={(e) =>
                        handleChange("maps_base_url", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Analytics ID</Label>
                    <Input
                      value={form.analytics_id}
                      onChange={(e) =>
                        handleChange("analytics_id", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Captcha Key</Label>
                    <Input
                      value={form.captcha_site_key}
                      onChange={(e) =>
                        handleChange("captcha_site_key", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              {/* CLIMA */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <CloudSun className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">
                    Servicios Meteorológicos
                  </h3>
                </div>
                <div className="p-4 rounded-lg border bg-muted/20">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CloudSun className="h-4 w-4" />
                    El sistema utiliza actualmente <b>Open-Meteo</b> (gratuito)
                    para obtener el pronóstico de Cabrera de Mar.
                  </p>
                </div>
              </section>

              {/* HEADER / FOOTER */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <LayoutPanelTop className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Header / Footer</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">
                      Selector de idioma
                    </span>
                    <Switch
                      checked={!!form.show_language_switcher}
                      onCheckedChange={(checked) =>
                        handleChange("show_language_switcher", checked)
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">Redes en footer</span>
                    <Switch
                      checked={!!form.show_social_footer}
                      onCheckedChange={(checked) =>
                        handleChange("show_social_footer", checked)
                      }
                    />
                  </label>

                  {(
                    [
                      [
                        "privacy_page_id",
                        "Privacidad",
                        optionsByTemplate.privacy,
                      ],
                      ["cookies_page_id", "Cookies", optionsByTemplate.cookies],
                      [
                        "legal_page_id",
                        "Aviso Legal",
                        optionsByTemplate.legal_notice,
                      ],
                      [
                        "inclusion_page_id",
                        "Inclusión",
                        optionsByTemplate.inclusion,
                      ],
                    ] as [
                      keyof FormState,
                      string,
                      { id: number; label: string }[],
                    ][]
                  ).map(([field, label, opts]) => (
                    <div key={field} className="space-y-2">
                      <Label>{label}</Label>
                      <select
                        value={
                          (form[field] as string | number | undefined) ?? ""
                        }
                        onChange={(e) =>
                          handleChange(
                            field,
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Seleccionar página...</option>
                        {opts.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </section>

              {/* SEO */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">SEO Default</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Metatítulo</Label>
                    <Input
                      value={form.default_metatitle}
                      onChange={(e) =>
                        handleChange("default_metatitle", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Metadescripción</Label>
                    <Textarea
                      value={form.default_metadescription}
                      onChange={(e) =>
                        handleChange("default_metadescription", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageField
                      label="Imagen OG por defecto"
                      field="default_og_image_id"
                    />
                  </div>
                </div>
              </section>

              <div className="sticky bottom-4 z-10 flex justify-end bg-background/80 p-4 backdrop-blur-sm border rounded-lg shadow-sm">
                <Button type="submit" size="lg" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <ImageSelector
        open={!!activeImageField}
        onOpenChange={(open) => !open && setActiveImageField(null)}
        onSelect={handleImageSelect}
      />

      <VideoSelector
        open={videoSelectorOpen}
        onOpenChange={setVideoSelectorOpen}
        value={form.background_video_id}
        onSelect={handleVideoSelect}
      />
    </PageContainer>
  );
}
