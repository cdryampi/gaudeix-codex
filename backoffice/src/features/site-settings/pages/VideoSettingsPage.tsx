import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  TriangleAlert,
  Video,
  RefreshCw,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { siteSettingsApi } from "../api/siteSettings";
import { toast } from "sonner";
import { VideoSelector } from "@/features/media/components/VideoSelector";
import { MediaItem } from "@/features/media/types";

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

  // Extra state for previewing the CURRENTLY selected video object (beyond just ID)
  // We initialize this from the initial API load
  const [currentVideoFile, setCurrentVideoFile] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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
        setCurrentVideoFile(settings.background_video?.file ?? null);
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

  const handleVideoSelect = (video: MediaItem) => {
    handleChange("background_video_id", video.id);
    setCurrentVideoFile(video.file);
    toast.success("Vídeo seleccionado: " + video.original_name);
  };

  const handleClearVideo = () => {
    handleChange("background_video_id", null);
    setCurrentVideoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await siteSettingsApi.update(form);
      toast.success("Configuración de vídeo guardada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Configuración de Vídeo"
        description="Gestiona el contenido audiovisual de la portada (Hero) y enlaces externos."
      />

      <div className="grid gap-6 max-w-5xl mx-auto">
        {/* SECCIÓN 1: HERO VIDEO (CRÍTICO) */}
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Vídeo de Portada (Hero)
              </CardTitle>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-muted/50 px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors">
                <Switch
                  checked={!!form.video_enabled}
                  onCheckedChange={(checked) =>
                    handleChange("video_enabled", checked)
                  }
                />
                {form.video_enabled ? "Activado" : "Desactivado"}
              </label>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Este vídeo se reproduce automáticamente en bucle en la pantalla
              principal.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!form.video_enabled && (
              <Alert variant="default" className="bg-muted/50">
                <AlertDescription>
                  El vídeo está desactivado. La portada mostrará la imagen por
                  defecto o un color sólido.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Preview Area */}
              <div className="space-y-3">
                <Label>Vista Previa</Label>
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border relative group shadow-inner">
                  {currentVideoFile ? (
                    <video
                      src={currentVideoFile}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Video className="h-12 w-12 opacity-20" />
                      <span className="text-sm">Sin vídeo seleccionado</span>
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPickerOpen(true)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cambiar
                    </Button>
                    {currentVideoFile && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearVideo}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {currentVideoFile && (
                  <p className="text-xs text-center text-muted-foreground">
                    ID: {form.background_video_id}
                  </p>
                )}
              </div>

              {/* Selection & Info Area */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Archivo de Vídeo</Label>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3"
                      onClick={() => setPickerOpen(true)}
                    >
                      <Video className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div className="text-left flex-1">
                        <div className="font-medium text-foreground">
                          {currentVideoFile
                            ? "Cambiar vídeo seleccionado"
                            : "Seleccionar vídeo de la librería"}
                        </div>
                        <div className="text-xs text-muted-foreground font-normal">
                          Haz click para subir uno nuevo o elegir existente
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Alert variant="destructive" className="py-3">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle className="text-sm font-semibold">
                    Requisitos de Rendimiento
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1 space-y-1">
                    <p>
                      • Peso máximo recomendado: <strong>10 MB</strong> (Ideal:
                      &lt;5MB)
                    </p>
                    <p>
                      • <strong>Sin pista de audio</strong> (elimínala antes de
                      subir)
                    </p>
                    <p>• Formato MP4 optimizado para web</p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div className="space-y-2">
                <Label>Título (Accesibilidad)</Label>
                <Input
                  value={form.video_title}
                  onChange={(e) => handleChange("video_title", e.target.value)}
                  placeholder="Ej: Vista aérea de la playa..."
                />
              </div>
              <div className="space-y-2">
                <Label>Notas internas</Label>
                <Textarea
                  value={form.video_description_internal}
                  onChange={(e) =>
                    handleChange("video_description_internal", e.target.value)
                  }
                  placeholder="Notas para el equipo sobre este vídeo..."
                  rows={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 2: YOUTUBE (SECUNDARIO) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Enlace Externo (YouTube)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-[1fr_200px] gap-4">
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input
                  value={form.youtube_url}
                  onChange={(e) => handleChange("youtube_url", e.target.value)}
                  placeholder="https://youtu.be/..."
                />
                <p className="text-xs text-muted-foreground">
                  Enlace opcional. Se usa habitualmente para un botón "Ver vídeo
                  completo" o un modal promocional.
                </p>
              </div>
              {form.youtube_url && (
                <div className="space-y-2">
                  <Label className="opacity-0">Preview</Label>
                  <a
                    href={form.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-10 px-4 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    Probar enlace <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 pb-10">
          <Button size="lg" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <VideoSelector
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={form.background_video_id}
        onSelect={handleVideoSelect}
      />
    </PageContainer>
  );
}
