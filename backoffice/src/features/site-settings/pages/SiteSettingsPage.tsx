import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { siteSettingsApi } from "../api/siteSettings";
import { StaticPage } from "@/features/static-pages/types";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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
  };
}

export function SiteSettingsPage() {
  const [form, setForm] = useState<FormState>(mapDefaults());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [settings, pages] = await Promise.all([siteSettingsApi.get(), staticPagesApi.list()]);
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

  const handleChange = (field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await siteSettingsApi.update(form);
      toast.success("Configuración guardada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la configuración");
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

  return (
    <PageContainer>
      <PageHeader title="Site settings" description="Configura branding, contacto, redes e integraciones públicas." />

      <Alert variant="destructive" className="mb-4 w-3/4">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Header/Footer en BETA</AlertTitle>
        <AlertDescription className="text-sm">
          Los enlaces legales y la visualización del footer pueden requerir ajustes en frontend. Revisa después de guardar.
        </AlertDescription>
      </Alert>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">Cargando...</div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del sitio</Label>
                  <Input value={form.site_name} onChange={(e) => handleChange("site_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Claim / Tagline</Label>
                  <Input value={form.tagline} onChange={(e) => handleChange("tagline", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Logo (ID)</Label>
                  <Input
                    value={form.logo_id ?? ""}
                    onChange={(e) => handleChange("logo_id", e.target.value ? Number(e.target.value) : null)}
                    placeholder="ID de imagen"
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo introduce el ID de la imagen (no se listan todas para evitar cargas masivas).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Logo (dark) ID</Label>
                  <Input
                    value={form.logo_dark_id ?? ""}
                    onChange={(e) => handleChange("logo_dark_id", e.target.value ? Number(e.target.value) : null)}
                    placeholder="ID de imagen"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favicon (ID)</Label>
                  <Input
                    value={form.favicon_id ?? ""}
                    onChange={(e) => handleChange("favicon_id", e.target.value ? Number(e.target.value) : null)}
                    placeholder="ID de imagen"
                  />
                </div>
              </section>

              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground">Contacto</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email soporte</Label>
                    <Input value={form.support_email} onChange={(e) => handleChange("support_email", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email contacto</Label>
                    <Input value={form.contact_email} onChange={(e) => handleChange("contact_email", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Horario</Label>
                    <Input value={form.schedule} onChange={(e) => handleChange("schedule", e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground">Redes sociales</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input value={form.facebook_url} onChange={(e) => handleChange("facebook_url", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input value={form.instagram_url} onChange={(e) => handleChange("instagram_url", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter/X</Label>
                    <Input value={form.twitter_url} onChange={(e) => handleChange("twitter_url", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input value={form.youtube_url} onChange={(e) => handleChange("youtube_url", e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground">Integraciones públicas</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Maps base URL</Label>
                    <Input value={form.maps_base_url} onChange={(e) => handleChange("maps_base_url", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Analytics ID</Label>
                    <Input value={form.analytics_id} onChange={(e) => handleChange("analytics_id", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Captcha site key</Label>
                    <Input value={form.captcha_site_key} onChange={(e) => handleChange("captcha_site_key", e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground">Vídeo hero</h3>
                <p className="text-xs text-muted-foreground">
                  Usa un vídeo propio (ID) o un enlace de YouTube. El vídeo interno se reproduce sin sonido como fondo.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm md:col-span-2">
                    <span>Activar vídeo de fondo (hero)</span>
                    <input
                      type="checkbox"
                      checked={!!form.video_enabled}
                      onChange={(e) => handleChange("video_enabled", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                  <div className="space-y-2">
                    <Label>Video ID (interno)</Label>
                    <Input
                      value={form.background_video_id ?? ""}
                      onChange={(e) => handleChange("background_video_id", e.target.value ? Number(e.target.value) : null)}
                      placeholder="ID de VideoFile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Youtube URL</Label>
                    <Input
                      value={form.youtube_url || ""}
                      onChange={(e) => handleChange("youtube_url", e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Título interno</Label>
                    <Input
                      value={form.video_title || ""}
                      onChange={(e) => handleChange("video_title", e.target.value)}
                      placeholder="Vídeo Cabrera de Mar"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Descripción interna</Label>
                    <Textarea
                      value={form.video_description_internal || ""}
                      onChange={(e) => handleChange("video_description_internal", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Header/Footer (BETA)</h3>
                  <Badge>Beta</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ajusta con cuidado: estos enlaces se usan en el header/footer público.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm">
                    <span>Mostrar selector de idioma</span>
                    <input
                      type="checkbox"
                      checked={!!form.show_language_switcher}
                      onChange={(e) => handleChange("show_language_switcher", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm">
                    <span>Mostrar redes en footer</span>
                    <input
                      type="checkbox"
                      checked={!!form.show_social_footer}
                      onChange={(e) => handleChange("show_social_footer", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                  {[
                    ["privacy_page_id", "Página de privacidad", optionsByTemplate.privacy],
                    ["cookies_page_id", "Página de cookies", optionsByTemplate.cookies],
                    ["legal_page_id", "Avís legal", optionsByTemplate.legal_notice],
                    ["inclusion_page_id", "Diversitat i inclusió", optionsByTemplate.inclusion],
                  ].map(([field, label, opts]) => (
                    <div key={field} className="space-y-2">
                      <Label>{label}</Label>
                      <select
                        value={(form as any)[field] ?? ""}
                        onChange={(e) => handleChange(field as keyof FormState, e.target.value ? Number(e.target.value) : null)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        <option value="">Sin asignar</option>
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

              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground">SEO por defecto</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Metatítulo</Label>
                    <Input value={form.default_metatitle} onChange={(e) => handleChange("default_metatitle", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Metadescripción</Label>
                    <Textarea
                      value={form.default_metadescription}
                      onChange={(e) => handleChange("default_metadescription", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Imagen OG por defecto (ID)</Label>
                    <Input
                      value={form.default_og_image_id ?? ""}
                      onChange={(e) =>
                        handleChange("default_og_image_id", e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="ID de imagen"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
