import { useEffect, useState } from "react";
import { Check, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
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

interface ImageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: number | null;
  onSelect: (image: MediaItem) => void;
}

export function ImageSelector({
  open,
  onOpenChange,
  value,
  onSelect,
}: ImageSelectorProps) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("library");

  useEffect(() => {
    if (open && activeTab === "library") {
      fetchImages();
    }
  }, [open, activeTab]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await mediaApi.listImages();
      setImages(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar imágenes");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    try {
      setUploading(true);
      const newImage = await mediaApi.upload(file);
      toast.success("Imagen subida correctamente");
      onSelect(newImage);
      onOpenChange(false);
      fetchImages();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Seleccionar Imagen</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 border-b">
            <TabsList>
              <TabsTrigger value="library">Biblioteca</TabsTrigger>
              <TabsTrigger value="upload">Subir Nueva</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="library"
            className="flex-1 overflow-hidden p-0 m-0 relative"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando librería...
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-20" />
                <p>No hay imágenes subidas todavía.</p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("upload")}
                >
                  Subir la primera
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full p-6">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
                  {images.map((image) => {
                    const isSelected = value === image.id;
                    return (
                      <Card
                        key={image.id}
                        className={cn(
                          "cursor-pointer group relative overflow-hidden border-2 transition-all aspect-square hover:border-primary/50",
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent",
                        )}
                        onClick={() => {
                          onSelect(image);
                          onOpenChange(false);
                        }}
                      >
                        <img
                          src={
                            image.thumbnail_url ||
                            image.variant_thumbnail ||
                            image.file
                          }
                          alt={image.original_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.original_name}
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
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-foreground transition-colors">
                  <div className="p-4 rounded-full bg-muted group-hover:bg-background transition-colors">
                    {uploading ? (
                      <Loader2 className="animate-spin h-8 w-8" />
                    ) : (
                      <Upload className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">
                      Haz click o arrastra una imagen
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      JPG, PNG, WebP o GIF. Máx 10MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
