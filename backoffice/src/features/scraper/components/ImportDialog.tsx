/**
 * ImportDialog - Dialog for importing scraped news
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ScrapedNewsListItem, ImportScrapedNewsDTO } from "../types";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ScrapedNewsListItem | null;
  onImport: (id: number, options: ImportScrapedNewsDTO) => Promise<void>;
}

export function ImportDialog({
  open,
  onOpenChange,
  item,
  onImport,
}: ImportDialogProps) {
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!item) return;

    setLoading(true);
    try {
      await onImport(item.id, {
        auto_translate: autoTranslate,
        publish,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setAutoTranslate(false);
        setPublish(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar noticia</DialogTitle>
          <DialogDescription>
            {item ? (
              <>
                ¿Deseas importar la noticia <strong>"{item.title}"</strong> al
                sistema de noticias?
              </>
            ) : (
              "Selecciona las opciones de importación"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="publish"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
            <Label htmlFor="publish" className="text-sm font-normal">
              Publicar inmediatamente
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="autoTranslate"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslate(e.target.checked)}
            />
            <Label htmlFor="autoTranslate" className="text-sm font-normal">
              Traducir automáticamente a otros idiomas
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={loading || !item}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
