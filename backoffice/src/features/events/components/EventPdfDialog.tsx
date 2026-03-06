import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/features/categories/types";
import { eventsApi } from "../api/events";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EventPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export function EventPdfDialog({
  open,
  onOpenChange,
  categories,
}: EventPdfDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [formatType, setFormatType] = useState<"A4" | "A3">("A4");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await eventsApi.exportPdf({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category_slug: categorySlug !== "all" ? categorySlug : undefined,
        format: formatType,
      });
      toast.success("PDF generado exitosamente");
      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Ocurrió un error al generar el PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar Programa Premium (PDF)</DialogTitle>
          <DialogDescription>
            Genera un PDF con estética de folleto municipal con los eventos
            seleccionados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date_from" className="text-right">
              Desde
            </Label>
            <Input
              id="date_from"
              type="date"
              className="col-span-3"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date_to" className="text-right">
              Hasta
            </Label>
            <Input
              id="date_to"
              type="date"
              className="col-span-3"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoría
            </Label>
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id.toString()} value={c.slug}>
                    {c.nombre || c.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Formato
            </Label>
            <Select
              value={formatType}
              onValueChange={(v) => setFormatType(v as "A4" | "A3")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (Estándar)</SelectItem>
                <SelectItem value="A3">A3 (Póster)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Generando..." : "Descargar PDF"}
            {!isExporting && <Download className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
