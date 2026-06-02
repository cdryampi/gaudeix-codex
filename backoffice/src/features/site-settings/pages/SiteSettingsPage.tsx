import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  Eye,
  History,
} from "lucide-react";
import { siteSettingsApi } from "../api/siteSettings";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { StaticPage } from "@/features/static-pages/types";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ImageSelector } from "@/features/media/components/ImageSelector";
import { VideoSelector } from "@/features/media/components/VideoSelector";
import { MediaItem } from "@/features/media/types";
import { BuildJob, ThemeConfig } from "../types";

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
    theme_config: {
      primary: "#E7640C",
      secondary: "#0F76A4",
      accent: "#F9B31F",
      background_light: "#FAFCFE",
      background_dark: "#0f172a",
      surface: "#FFFFFF",
      surface_muted: "#f3f6f9",
      text_primary: "#111827",
      text_secondary: "#475569",
      radius_scale: 1.0,
      shadow_preset: "md" as "none" | "sm" | "md" | "lg",
      theme_preset: "classic" as
        | "classic"
        | "modern"
        | "vibrant"
        | "oceanic"
        | "sunset",
    } as ThemeConfig,
    theme_config_published: {} as ThemeConfig,
  };
}

// 5 presets de la familia corporativa (paleta oficial Gaudeix).
// Cada preset mantiene la base neutra de texto/fondo y solo varía
// primary/secondary/accent dentro de la paleta.
const presets = {
  classic: {
    primary: "#E7640C",
    secondary: "#0F76A4",
    accent: "#F9B31F",
    background_light: "#FAFCFE",
    background_dark: "#0f172a",
    surface: "#FFFFFF",
    surface_muted: "#f3f6f9",
    text_primary: "#111827",
    text_secondary: "#475569",
    radius_scale: 1.0,
    shadow_preset: "md" as const,
    theme_preset: "classic" as const,
  },
  modern: {
    primary: "#C94B00",
    secondary: "#0F76A4",
    accent: "#93C01F",
    background_light: "#FAFCFE",
    background_dark: "#0f172a",
    surface: "#FFFFFF",
    surface_muted: "#f3f6f9",
    text_primary: "#111827",
    text_secondary: "#475569",
    radius_scale: 0.5,
    shadow_preset: "sm" as const,
    theme_preset: "modern" as const,
  },
  vibrant: {
    primary: "#E7640C",
    secondary: "#7BC2EC",
    accent: "#F9B31F",
    background_light: "#FAFCFE",
    background_dark: "#0f172a",
    surface: "#FFFFFF",
    surface_muted: "#eaf7fd",
    text_primary: "#111827",
    text_secondary: "#475569",
    radius_scale: 1.0,
    shadow_preset: "md" as const,
    theme_preset: "vibrant" as const,
  },
  oceanic: {
    primary: "#0F76A4",
    secondary: "#7BC2EC",
    accent: "#93C01F",
    background_light: "#FAFCFE",
    background_dark: "#0f172a",
    surface: "#FFFFFF",
    surface_muted: "#eaf7fd",
    text_primary: "#111827",
    text_secondary: "#475569",
    radius_scale: 1.5,
    shadow_preset: "lg" as const,
    theme_preset: "oceanic" as const,
  },
  sunset: {
    primary: "#E7640C",
    secondary: "#036830",
    accent: "#F9B31F",
    background_light: "#FAFCFE",
    background_dark: "#0f172a",
    surface: "#FFFFFF",
    surface_muted: "#e6f5e9",
    text_primary: "#111827",
    text_secondary: "#475569",
    radius_scale: 1.0,
    shadow_preset: "md" as const,
    theme_preset: "sunset" as const,
  },
};

export function SiteSettingsPage() {
  const [form, setForm] = useState<FormState>(mapDefaults());
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);

  const [builds, setBuilds] = useState<BuildJob[]>([]);
  const [activeBuild, setActiveBuild] = useState<BuildJob | null>(null);
  const [publishing, setPublishing] = useState(false);

  const [activeImageField, setActiveImageField] = useState<
    keyof FormState | null
  >(null);
  const [videoSelectorOpen, setVideoSelectorOpen] = useState(false);

  const loadBuilds = async () => {
    try {
      const history = await siteSettingsApi.getBuilds();
      setBuilds(history);
      const running = history.find(
        (b) => b.status === "pending" || b.status === "running",
      );
      setActiveBuild(running ?? null);
      return running;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      activeBuild &&
      (activeBuild.status === "pending" || activeBuild.status === "running")
    ) {
      interval = setInterval(async () => {
        const running = await loadBuilds();
        if (!running) {
          toast.success("Publicació completada amb èxit!");
          const settings = await siteSettingsApi.get();
          setForm((prev) => ({
            ...prev,
            theme_config_published: settings.theme_config_published,
          }));
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBuild]);

  const handlePublishTheme = async () => {
    setPublishing(true);
    try {
      const job = await siteSettingsApi.publish();
      toast.success("Publicació del tema iniciada!");
      setActiveBuild(job);
      loadBuilds();
    } catch (err) {
      console.error(err);
      toast.error("No s'ha pogut iniciar la publicació.");
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [settings, pages, history] = await Promise.all([
          siteSettingsApi.get(),
          staticPagesApi.list(),
          siteSettingsApi.getBuilds().catch(() => [] as BuildJob[]),
        ]);
        setStaticPages(pages);
        setBuilds(history);
        const running = history.find(
          (b) => b.status === "pending" || b.status === "running",
        );
        setActiveBuild(running ?? null);

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
          theme_config: {
            ...mapDefaults().theme_config,
            ...(settings.theme_config ?? {}),
          },
          theme_config_published: settings.theme_config_published ?? {},
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
      {loading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Cargando...
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general">Configuracions Generals</TabsTrigger>
            <TabsTrigger value="theme">
              Personalització Visual i Publicació
            </TabsTrigger>
          </TabsList>

          {/* GENERAL SETTINGS TAB */}
          <TabsContent value="general">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
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
                          onChange={(e) =>
                            handleChange("tagline", e.target.value)
                          }
                        />
                      </div>

                      <ImageField label="Logotipo Principal" field="logo_id" />
                      <ImageField
                        label="Logotipo Oscuro"
                        field="logo_dark_id"
                      />
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
                          onChange={(e) =>
                            handleChange("phone", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleChange("address", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Horario</Label>
                        <Input
                          value={form.schedule}
                          onChange={(e) =>
                            handleChange("schedule", e.target.value)
                          }
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

                  {/* AVISOS GLOBALES */}
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
                              Se recomienda formato MP4, sin audio y tamaño
                              menor a 10MB.
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
                        El sistema utiliza actualmente <b>Open-Meteo</b>{" "}
                        (gratuito) para obtener el pronóstico de Cabrera de Mar.
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
                        <span className="text-sm font-medium">
                          Redes en footer
                        </span>
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
                          [
                            "cookies_page_id",
                            "Cookies",
                            optionsByTemplate.cookies,
                          ],
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
                            handleChange(
                              "default_metadescription",
                              e.target.value,
                            )
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* VISUAL THEME TAB */}
          <TabsContent value="theme" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              {/* CONFIGURATION COLUMN */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border-border bg-card">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">
                          Personalització del Tema
                        </h3>
                      </div>
                      <select
                        value={form.theme_config?.theme_preset || "classic"}
                        onChange={(e) => {
                          const preset =
                            presets[e.target.value as keyof typeof presets];
                          if (preset) {
                            setForm((prev) => ({
                              ...prev,
                              theme_config: { ...prev.theme_config, ...preset },
                            }));
                            toast.info(
                              `S'ha aplicat el preset: ${e.target.value}`,
                            );
                          }
                        }}
                        className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none"
                      >
                        <option value="classic">Preset: Clàssic</option>
                        <option value="modern">Preset: Modern</option>
                        <option value="oceanic">Preset: Oceànic</option>
                        <option value="sunset">Preset: Sunset</option>
                      </select>
                    </div>

                    {/* COLOR PICKERS GRID */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          [
                            "primary",
                            "Color Primari",
                            "Botons principals, links, capçaleres",
                          ],
                          [
                            "secondary",
                            "Color Secundari",
                            "Elements secundaris d'èmfasi",
                          ],
                          [
                            "accent",
                            "Color Accent",
                            "Detalls destacats, alerts, crides",
                          ],
                          [
                            "background_light",
                            "Fons Clar",
                            "Color de fons de la web pública (Clar)",
                          ],
                          [
                            "background_dark",
                            "Fons Fosc",
                            "Color de fons de la web pública (Fosc)",
                          ],
                          [
                            "surface",
                            "Fons Superfície",
                            "Fons de targetes o contingut blanc",
                          ],
                          [
                            "surface_muted",
                            "Fons Atenuat",
                            "Fons de seccions secundàries d'informació",
                          ],
                          [
                            "text_primary",
                            "Text Principal",
                            "Color del text de títols i paràgrafs",
                          ],
                          [
                            "text_secondary",
                            "Text Secundari",
                            "Color de subtítols o meta-informació",
                          ],
                        ] as const
                      ).map(([field, label, desc]) => (
                        <div
                          key={field}
                          className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">
                              {label}
                            </Label>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {form.theme_config?.[field] || "#000000"}
                              </span>
                              <div
                                className="h-4 w-4 rounded-full border shadow-sm"
                                style={{
                                  backgroundColor:
                                    form.theme_config?.[field] || "#000000",
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={form.theme_config?.[field] || "#000000"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((prev) => ({
                                  ...prev,
                                  theme_config: {
                                    ...prev.theme_config,
                                    [field]: val,
                                  },
                                }));
                              }}
                              className="h-8 w-12 cursor-pointer p-0 border-0 bg-transparent rounded shrink-0"
                            />
                            <Input
                              type="text"
                              maxLength={7}
                              value={form.theme_config?.[field] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((prev) => ({
                                  ...prev,
                                  theme_config: {
                                    ...prev.theme_config,
                                    [field]: val,
                                  },
                                }));
                              }}
                              placeholder="#000000"
                              className="h-8 text-xs font-mono px-2"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* RADIUS AND SHADOWS */}
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20">
                        <Label className="text-xs font-semibold">
                          Escala d'Arrodoniment (Radius)
                        </Label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={form.theme_config?.radius_scale ?? 1.0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setForm((prev) => ({
                                ...prev,
                                theme_config: {
                                  ...prev.theme_config,
                                  radius_scale: val,
                                },
                              }));
                            }}
                            className="w-full cursor-pointer accent-primary"
                          />
                          <span className="text-xs font-semibold w-8 text-right font-mono">
                            {form.theme_config?.radius_scale ?? 1.0}x
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Defineix com de rodons seran els botons i les
                          targetes.
                        </p>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20">
                        <Label className="text-xs font-semibold">
                          Tipus d'Ombres (Shadow)
                        </Label>
                        <select
                          value={form.theme_config?.shadow_preset || "md"}
                          onChange={(e) => {
                            const val = e.target.value as
                              | "none"
                              | "sm"
                              | "md"
                              | "lg";
                            setForm((prev) => ({
                              ...prev,
                              theme_config: {
                                ...prev.theme_config,
                                shadow_preset: val,
                              },
                            }));
                          }}
                          className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                        >
                          <option value="none">Sense Ombra (none)</option>
                          <option value="sm">Ombra Suau (sm)</option>
                          <option value="md">Ombra Mitjana (md)</option>
                          <option value="lg">Ombra Pronunciada (lg)</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground">
                          Controla l'elevació visual dels elements de la
                          interfície.
                        </p>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-3 border-t pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          setSaving(true);
                          try {
                            await siteSettingsApi.update(form);
                            toast.success(
                              "Borrador de tema guardat correctament!",
                            );
                          } catch (err) {
                            console.error(err);
                            toast.error("Error al desar el borrador.");
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                      >
                        {saving ? "Desant..." : "Desar Borrador"}
                      </Button>

                      <Button
                        type="button"
                        variant="default"
                        onClick={async () => {
                          setSaving(true);
                          try {
                            await siteSettingsApi.update(form);
                            await handlePublishTheme();
                          } catch (err) {
                            console.error(err);
                            toast.error("Error en publicar els canvis.");
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={
                          saving ||
                          (activeBuild !== null &&
                            (activeBuild.status === "pending" ||
                              activeBuild.status === "running"))
                        }
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${publishing ? "animate-spin" : ""}`}
                        />
                        Publicar al Portal
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* BUILDS MONITOR */}
                <Card className="border-border bg-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <History className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">
                        Historial de Publicació (Deploys)
                      </h3>
                    </div>

                    {/* ACTIVE BUILD STATE */}
                    {activeBuild ? (
                      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                            <span className="text-sm font-semibold text-primary">
                              Compilació en progrés...
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Estat actual:{" "}
                            <b>
                              {activeBuild.status === "pending"
                                ? "En cua"
                                : "Processant"}
                            </b>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Iniciat:{" "}
                            {new Date(activeBuild.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary animate-pulse"
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>
                    ) : builds.length > 0 && builds[0].status === "success" ? (
                      <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            Portal Actualitzat
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Darrer deploy exitós el{" "}
                            {new Date(
                              builds[0].finished_at || builds[0].created_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : builds.length > 0 && builds[0].status === "failed" ? (
                      <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                        <div className="space-y-0.5 w-full">
                          <span className="text-sm font-semibold text-destructive">
                            Deploy Fallit
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {builds[0].error_message ||
                              "Error desconegut durant el build."}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Data:{" "}
                            {new Date(builds[0].created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* LIST HISTORY */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {builds.slice(0, 5).map((build) => (
                        <div
                          key={build.id}
                          className="flex items-center justify-between p-2 rounded border border-border bg-muted/20 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold">
                              Deploy #{build.id}
                            </span>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(build.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                build.status === "success"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : build.status === "failed"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {build.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* MOCKUP LIVE PREVIEW */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">
                    Previsualització en Viu
                  </h3>
                </div>

                {/* THE PORTAL LIVE PREVIEW */}
                <div
                  className="border border-border rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
                  style={{
                    backgroundColor:
                      form.theme_config?.background_light || "#ffffff",
                    borderRadius: `${(form.theme_config?.radius_scale ?? 1.0) * 0.75}rem`,
                    boxShadow:
                      form.theme_config?.shadow_preset === "none"
                        ? "none"
                        : form.theme_config?.shadow_preset === "sm"
                          ? "0 1px 3px rgba(0,0,0,0.1)"
                          : form.theme_config?.shadow_preset === "lg"
                            ? "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
                            : "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {/* PREVIEW NAVIGATION NAVBAR */}
                  <div
                    className="px-4 py-3 border-b flex items-center justify-between text-xs"
                    style={{
                      borderColor:
                        form.theme_config?.surface_muted || "#e2e8f0",
                      backgroundColor: form.theme_config?.surface || "#ffffff",
                      color: form.theme_config?.text_primary || "#0f172a",
                    }}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <div
                        className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                        style={{
                          backgroundColor:
                            form.theme_config?.primary || "#1e3a8a",
                          borderRadius: `${(form.theme_config?.radius_scale ?? 1.0) * 0.25}rem`,
                        }}
                      >
                        G
                      </div>
                      <span>{form.site_name || "Gaudeix Codex"}</span>
                    </div>
                    <div
                      className="flex gap-3 text-[10px] font-medium"
                      style={{
                        color: form.theme_config?.text_secondary || "#475569",
                      }}
                    >
                      <span
                        className="hover:opacity-80 cursor-pointer"
                        style={{
                          color: form.theme_config?.primary || "#1e3a8a",
                        }}
                      >
                        Home
                      </span>
                      <span className="hover:opacity-80 cursor-pointer">
                        Activitats
                      </span>
                      <span className="hover:opacity-80 cursor-pointer">
                        Notícies
                      </span>
                    </div>
                  </div>

                  {/* PREVIEW HERO CONTENT */}
                  <div className="p-6 space-y-4">
                    {/* Mock alert banner */}
                    <div
                      className="p-2 text-[10px] text-center font-semibold rounded flex items-center justify-center gap-1.5"
                      style={{
                        backgroundColor: `${form.theme_config?.accent || "#f59e0b"}15`,
                        color: form.theme_config?.accent || "#f59e0b",
                        borderRadius: `${(form.theme_config?.radius_scale ?? 1.0) * 0.25}rem`,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full animate-ping shrink-0"
                        style={{
                          backgroundColor:
                            form.theme_config?.accent || "#f59e0b",
                        }}
                      />
                      Festa Major Cabrera de Mar 2026!
                    </div>

                    {/* Hero title & tagline */}
                    <div className="space-y-1">
                      <h4
                        className="text-lg font-extrabold tracking-tight"
                        style={{
                          color: form.theme_config?.text_primary || "#0f172a",
                        }}
                      >
                        Descobreix Cabrera de Mar
                      </h4>
                      <p
                        className="text-xs"
                        style={{
                          color: form.theme_config?.text_secondary || "#475569",
                        }}
                      >
                        {form.tagline ||
                          "Portal turístic i cultural oficial del municipi."}
                      </p>
                    </div>

                    {/* Main call to action button */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-4 py-1.5 text-[10px] font-bold text-white transition-all cursor-default shadow-sm flex items-center gap-1"
                        style={{
                          backgroundColor:
                            form.theme_config?.primary || "#1e3a8a",
                          borderRadius: `${(form.theme_config?.radius_scale ?? 1.0) * 0.375}rem`,
                        }}
                      >
                        Explorar Agenda{" "}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </button>
                      <button
                        type="button"
                        className="px-4 py-1.5 text-[10px] font-semibold border transition-all cursor-default"
                        style={{
                          borderColor:
                            form.theme_config?.surface_muted || "#cbd5e1",
                          color: form.theme_config?.text_primary || "#0f172a",
                          borderRadius: `${(form.theme_config?.radius_scale ?? 1.0) * 0.375}rem`,
                        }}
                      >
                        Saber més
                      </button>
                    </div>

                    {/* Feature mock cards */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[
                        [
                          "Castell de Burriac",
                          "Rutes de senderisme",
                          "/uploads/burriac.jpg",
                        ],
                        [
                          "Platja dels Vinyals",
                          "Turisme de platja",
                          "/uploads/beach.jpg",
                        ],
                      ].map(([title, desc]) => (
                        <div
                          key={title}
                          className="border p-2.5 space-y-1.5 transition-all shadow-sm"
                          style={{
                            backgroundColor:
                              form.theme_config?.surface || "#ffffff",
                            borderColor:
                              form.theme_config?.surface_muted || "#e2e8f0",
                            borderRadius: `${(form.theme_config?.radius_scale ?? 1.0) * 0.5}rem`,
                          }}
                        >
                          <div className="h-14 w-full bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground font-mono bg-muted/40">
                            Imatge Destacada
                          </div>
                          <div className="space-y-0.5">
                            <span
                              className="text-[10px] font-bold block"
                              style={{
                                color:
                                  form.theme_config?.text_primary || "#0f172a",
                              }}
                            >
                              {title}
                            </span>
                            <span
                              className="text-[9px]"
                              style={{
                                color:
                                  form.theme_config?.text_secondary ||
                                  "#475569",
                              }}
                            >
                              {desc}
                            </span>
                          </div>
                          <span
                            className="text-[9px] font-semibold hover:underline flex items-center gap-0.5"
                            style={{
                              color: form.theme_config?.secondary || "#0f766e",
                            }}
                          >
                            Veure detalls &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PREVIEW FOOTER */}
                  <div
                    className="p-4 border-t text-[9px] text-center space-y-2"
                    style={{
                      borderColor:
                        form.theme_config?.surface_muted || "#cbd5e1",
                      backgroundColor:
                        form.theme_config?.surface_muted || "#f1f5f9",
                      color: form.theme_config?.text_secondary || "#475569",
                    }}
                  >
                    <p>
                      &copy; {new Date().getFullYear()} Ajuntament de Cabrera de
                      Mar. Tots els drets reservats.
                    </p>
                    <div className="flex justify-center gap-3 text-[8px] font-semibold">
                      <span className="cursor-default hover:underline">
                        Privacitat
                      </span>
                      <span className="cursor-default hover:underline">
                        Avis Legal
                      </span>
                      <span className="cursor-default hover:underline">
                        Cookies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

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
