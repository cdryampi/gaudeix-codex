import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { ScraperSource } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StartScrapeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: ScraperSource[];
  onStart: (sourceSlug: string, maxPages: number) => Promise<void>;
}

export function StartScrapeDialog({
  open,
  onOpenChange,
  sources,
  onStart,
}: StartScrapeDialogProps) {
  const [selectedSource, setSelectedSource] = useState("");
  const [maxPages, setMaxPages] = useState("5");
  const [loading, setLoading] = useState(false);

  // Set default source when sources load
  if (!selectedSource && sources.length > 0) {
    setSelectedSource(sources[0].slug);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource) return;

    setLoading(true);
    try {
      await onStart(selectedSource, parseInt(maxPages) || 5);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Iniciar Scraping</DialogTitle>
          <DialogDescription>
            Configura los parámetros para iniciar el proceso de scraping.
          </DialogDescription>
        </DialogHeader>
        <form
          id="scrape-form"
          onSubmit={handleSubmit}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source" className="text-right">
              Fuente
            </Label>
            <div className="col-span-3">
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Selecciona una fuente" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.slug} value={source.slug}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxPages" className="text-right">
              Páginas
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="maxPages"
                type="number"
                min={1}
                max={50}
                required
                value={maxPages}
                onChange={(e) => setMaxPages(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Recomendado: 5 páginas (aprox 25 noticias)
              </p>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="scrape-form"
            disabled={loading || sources.length === 0}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Iniciar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
