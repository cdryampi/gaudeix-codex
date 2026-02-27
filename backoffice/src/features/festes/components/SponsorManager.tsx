/**
 * SponsorManager component for managing sponsors of a Festa.
 */
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";
import { sponsorsApi } from "../api/sponsors";
import { Sponsor, SponsorTier } from "../types";
import { SponsorFormDialog } from "./SponsorFormDialog";
import { useCallback } from "react";
import { toast } from "sonner";

interface Props {
  festaId: number;
}

const TIER_LABELS: Record<SponsorTier, string> = {
  platinum: "Platino",
  gold: "Oro",
  silver: "Plata",
  bronze: "Bronce",
  collaborator: "Colaborador",
};

const TIER_COLORS: Record<SponsorTier, string> = {
  platinum: "bg-slate-100 text-slate-800 border-slate-300",
  gold: "bg-amber-100 text-amber-800 border-amber-300",
  silver: "bg-slate-200 text-slate-700 border-slate-400",
  bronze: "bg-orange-100 text-orange-800 border-orange-300",
  collaborator: "bg-blue-100 text-blue-800 border-blue-300",
};

export function SponsorManager({ festaId }: Props) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | undefined>();

  const loadSponsors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await sponsorsApi.list({ festa: festaId });
      setSponsors(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar patrocinadores");
    } finally {
      setIsLoading(false);
    }
  }, [festaId]);

  useEffect(() => {
    if (festaId) loadSponsors();
  }, [festaId, loadSponsors]);

  const handleAdd = () => {
    setEditingSponsor(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este patrocinador?"))
      return;
    try {
      await sponsorsApi.delete(id);
      toast.success("Patrocinador eliminado");
      loadSponsors();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar patrocinador");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Patrocinadores
        </h3>
        <Button onClick={handleAdd} size="sm" className="h-8 gap-2">
          <Plus className="h-4 w-4" />
          Añadir
        </Button>
      </div>

      {isLoading ? (
        <div className="h-24 flex items-center justify-center border border-dashed rounded-lg">
          <p className="text-xs text-muted-foreground animate-pulse">
            Cargando patrocinadores...
          </p>
        </div>
      ) : sponsors.length === 0 ? (
        <div className="h-24 flex items-center justify-center border border-dashed rounded-lg bg-muted/20">
          <p className="text-xs text-muted-foreground">
            No hay patrocinadores añadidos aún.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <ul className="divide-y">
            {sponsors.map((sponsor) => (
              <li
                key={sponsor.id}
                className="flex items-center gap-4 p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded border bg-white">
                  <MediaThumbnail
                    src={
                      sponsor.logo?.thumbnail_url || sponsor.logo?.file || ""
                    }
                    alt={sponsor.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sponsor.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-4 px-1 ${TIER_COLORS[sponsor.tier]}`}
                    >
                      {TIER_LABELS[sponsor.tier]}
                    </Badge>
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(sponsor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(sponsor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SponsorFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        festaId={festaId}
        sponsor={editingSponsor}
        onSuccess={loadSponsors}
      />
    </div>
  );
}
