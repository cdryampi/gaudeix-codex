import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

import { MediaThumbnail } from "@/components/common/MediaThumbnail";
import { Beach } from "../types";

type Props = {
  beaches: Beach[];
  onEdit: (beach: Beach) => void;
  onDelete: (slug: string) => void;
};

export function BeachesTable({ beaches, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Título
            </th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Tipo
            </th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Ubicación
            </th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Estado
            </th>
            <th className="px-4 py-2 text-right font-semibold text-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {beaches.map((beach) => (
            <tr key={beach.id} className="hover:bg-muted/40">
              <td className="px-4 py-2">
                <div className="flex items-start gap-3">
                  <BeachThumbnail beach={beach} />
                  <div>
                    <div className="font-medium text-foreground">
                      {beach.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {beach.slug}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {formatBeachType(beach.beach_type)}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {beach.location_text ||
                  `${beach.latitude ?? ""} ${beach.longitude ?? ""}`}
              </td>
              <td className="px-4 py-2">
                <Badge variant={beach.is_published ? "default" : "secondary"}>
                  {beach.is_published ? "Publicada" : "Borrador"}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(beach)}
                    aria-label={`Editar ${beach.title}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(beach.slug)}
                    aria-label={`Eliminar ${beach.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {beaches.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-muted-foreground"
              >
                No hay playas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BeachThumbnail({ beach }: { beach: Beach }) {
  const src =
    beach.featured_media?.thumbnail_url ||
    beach.featured_media?.variant_thumbnail ||
    beach.featured_media?.file ||
    "";

  return <MediaThumbnail src={src} alt={beach.title} />;
}

function formatBeachType(type: Beach["beach_type"]) {
  if (type === "cove") return "Cala";
  if (type === "natural") return "Natural";
  return "Urbana";
}
