/**
 * SponsorFormDialog component for creating/editing a Sponsor.
 */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sponsor, SponsorTier } from "../types";
import { sponsorsApi } from "../api/sponsors";
import { ImageSelector } from "@/features/media/components/ImageSelector";
import { MediaItem } from "@/features/media/types";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  festaId: number;
  sponsor?: Sponsor;
  onSuccess: () => void;
}

const TIERS: { value: SponsorTier; label: string }[] = [
  { value: "platinum", label: "Platino" },
  { value: "gold", label: "Oro" },
  { value: "silver", label: "Plata" },
  { value: "bronze", label: "Bronce" },
  { value: "collaborator", label: "Colaborador" },
];

export function SponsorFormDialog({
  open,
  onOpenChange,
  festaId,
  sponsor,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [tier, setTier] = useState<SponsorTier>("gold");
  const [order, setOrder] = useState(1);
  const [logoId, setLogoId] = useState<number | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<MediaItem | null>(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sponsor) {
      setName(sponsor.name);
      setWebsite(sponsor.website || "");
      setTier(sponsor.tier);
      setOrder(sponsor.order);
      setLogoId(sponsor.logo?.id || null);
      setSelectedLogo(sponsor.logo || null);
    } else {
      setName("");
      setWebsite("");
      setTier("gold");
      setOrder(1);
      setLogoId(null);
      setSelectedLogo(null);
    }
  }, [sponsor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (sponsor) {
        await sponsorsApi.update(sponsor.id, {
          name,
          website,
          tier,
          order,
          logo_id: logoId,
        });
        toast.success("Patrocinador actualizado");
      } else {
        await sponsorsApi.create({
          festa: festaId,
          name,
          website,
          tier,
          order,
          logo_id: logoId,
        });
        toast.success("Patrocinador creado");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar patrocinador");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {sponsor ? "Editar Patrocinador" : "Nuevo Patrocinador"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="s-name">Nombre</Label>
            <Input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-website">Página Web (URL)</Label>
            <Input
              id="s-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="s-tier">Nivel</Label>
              <select
                id="s-tier"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={tier}
                onChange={(e) => setTier(e.target.value as SponsorTier)}
              >
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-order">Orden</Label>
              <Input
                id="s-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            {selectedLogo ? (
              <div className="relative group w-32 h-32 rounded-lg border overflow-hidden bg-white">
                <img
                  src={selectedLogo.thumbnail_url || selectedLogo.file}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setLogoId(null);
                    setSelectedLogo(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => setIsMediaSelectorOpen(true)}
              >
                Seleccionar Logo
              </Button>
            )}
            <ImageSelector
              open={isMediaSelectorOpen}
              onOpenChange={setIsMediaSelectorOpen}
              onSelect={(item) => {
                setLogoId(item.id);
                setSelectedLogo(item);
                setIsMediaSelectorOpen(false);
              }}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {sponsor ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
