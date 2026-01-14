import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { siteSettingsApi } from "../api/siteSettings";
import { toast } from "sonner";

type VideoFormState = {
  video_enabled: boolean;
  background_video_id: number | null;
  youtube_url: string;
  video_title: string;
  video_description_internal: string;
};

function defaults(): VideoFormState {
  return {
    video_enabled: true,
    background_video_id: null,
    youtube_url: "",
    video_title: "",
    video_description_internal: "",
  };
}

export function VideoSettingsPage() {
  const [form, setForm] = useState<VideoFormState>(defaults());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const settings = await siteSettingsApi.get();
        setForm({
          video_enabled: settings.video_enabled ?? true,
          background_video_id: settings.background_video_id ?? null,
          youtube_url: settings.youtube_url ?? "",
          video_title: settings.video_title ?? "",
          video_description_internal: settings.video_description_internal ?? "",
        });
        setBackgroundVideoUrl(settings.background_video?.file ?? null);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los ajustes de vídeo");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof VideoFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await siteSettingsApi.update(form);
      toast.success("Vídeo guardado");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar el vídeo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Vídeo" description="Configura el vídeo de fondo y el enlace de YouTube de la web." />

      <Alert variant="destructive" className="mb-4 w-3/4">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Vídeo del hero</AlertTitle>
        <AlertDescription className="text-sm">
          El vídeo de fondo se muestra en el hero de la home. El enlace de YouTube es auxiliar y opcional. Usa el enlace
          de compartir de YouTube (Share), por ejemplo: <span className="font-mono">https://youtu.be/ID</span>.
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
              {backgroundVideoUrl && (
                <div className="space-y-2">
                  <Label>Preview actual</Label>
                  <video
                    src={backgroundVideoUrl}
                    controls
                    muted
                    loop
                    playsInline
                    className="w-full rounded-md border border-border/60 bg-black"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm md:col-span-2">
                  <span>Activar vídeo de fondo (hero)</span>
                  <Switch
                    checked={!!form.video_enabled}
                    onCheckedChange={(checked) => handleChange("video_enabled", checked)}
                  />
                </label>

                <div className="space-y-2">
                  <Label>Video ID (interno)</Label>
                  <Input
                    value={form.background_video_id ?? ""}
                    onChange={(e) =>
                      handleChange("background_video_id", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="ID de VideoFile"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sube el vídeo en “Media” → “Videos” y pega aquí su ID.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Youtube URL</Label>
                  <Input
                    value={form.youtube_url}
                    onChange={(e) => handleChange("youtube_url", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Pega el enlace de compartir de YouTube (no embed). Es opcional.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Título interno</Label>
                  <Input
                    value={form.video_title}
                    onChange={(e) => handleChange("video_title", e.target.value)}
                    placeholder="Vídeo Cabrera de Mar"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Descripción interna</Label>
                  <Textarea
                    value={form.video_description_internal}
                    onChange={(e) => handleChange("video_description_internal", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
