import { useEffect, useState } from "react";
import { Check, Film, Upload, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { mediaApi } from "../api/media";
import { MediaItem } from "../types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: number | null;
  onSelect: (video: MediaItem) => void;
}

export function VideoSelector({
  open,
  onOpenChange,
  value,
  onSelect,
}: VideoSelectorProps) {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("library");

  useEffect(() => {
    if (open && activeTab === "library") {
      fetchVideos();
    }
  }, [open, activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await mediaApi.listVideos();
      // Sort by newest first
      setVideos(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar videos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Por favor selecciona un archivo de vídeo válido");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      // 20MB warning
      toast.warning("El vídeo es mayor de 20MB, puede afectar al rendimiento");
    }

    try {
      setUploading(true);
      const newVideo = await mediaApi.upload(file);
      toast.success("Vídeo subido correctamente");
      onSelect(newVideo);
      onOpenChange(false);
      // Refresh list for next time
      fetchVideos();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el vídeo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Gestión de Vídeo</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 border-b">
            <TabsList>
              <TabsTrigger value="library">Biblioteca</TabsTrigger>
              <TabsTrigger value="upload">Subir Nuevo</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="library"
            className="flex-1 overflow-hidden p-0 m-0 relative"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Cargando librería...
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Film className="h-12 w-12 opacity-20" />
                <p>No hay vídeos subidos todavía.</p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("upload")}
                >
                  Subir el primero
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">
                  {videos.map((video) => {
                    const isSelected = value === video.id;
                    return (
                      <Card
                        key={video.id}
                        className={cn(
                          "cursor-pointer group relative overflow-hidden border-2 transition-all hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-transparent bg-muted/30",
                        )}
                        onClick={() => {
                          onSelect(video);
                          onOpenChange(false);
                        }}
                      >
                        <div className="aspect-video bg-black relative flex items-center justify-center">
                          <video
                            src={video.file}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            muted
                            playsInline
                            onMouseOver={(e) =>
                              e.currentTarget.play().catch(() => {})
                            }
                            onMouseOut={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Play className="h-8 w-8 text-white drop-shadow-md fill-white/50" />
                          </div>
                        </div>
                        <div className="p-3 text-xs">
                          <p
                            className="font-medium truncate"
                            title={video.original_name}
                          >
                            {video.original_name}
                          </p>
                          <p className="text-muted-foreground">
                            {(video.size_bytes / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent
            value="upload"
            className="flex-1 flex items-center justify-center p-6 m-0"
          >
            <div className="max-w-md w-full text-center space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-12 hover:bg-muted/50 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept="video/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-foreground transition-colors">
                  <div className="p-4 rounded-full bg-muted group-hover:bg-background transition-colors">
                    {uploading ? (
                      <span className="animate-spin text-2xl">⏳</span>
                    ) : (
                      <Upload className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">
                      Haz click o arrastra un vídeo
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      MP4, WebM o MOV. Máx 20MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left text-sm text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Recomendación para Hero:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Usa formato <strong>MP4 (H.264)</strong> para máxima
                    compatibilidad.
                  </li>
                  <li>Elimina la pista de audio antes de subirlo.</li>
                  <li>
                    Intenta mantenerlo bajo <strong>5MB</strong> para carga
                    rápida.
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
