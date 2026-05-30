import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";
import type { Accommodation } from "../types";

const TYPE_LABELS: Record<string, string> = {
  hotel: "Hotel",
  hostel: "Hostal",
  apartment: "Apartamento",
  campsite: "Camping",
  rural: "Casa rural",
  other: "Otro",
};

type Props = {
  accommodations: Accommodation[];
  onEdit: (a: Accommodation) => void;
  onDelete: (slug: string) => void;
};

export function AccommodationsTable({
  accommodations,
  onEdit,
  onDelete,
}: Props) {
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
              Estrellas
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
          {accommodations.map((a) => (
            <tr key={a.id} className="hover:bg-muted/40">
              <td className="px-4 py-2">
                <div className="flex items-start gap-3">
                  <MediaThumbnail
                    src={
                      a.featured_media?.thumbnail_url ||
                      a.featured_media?.variant_thumbnail ||
                      a.featured_media?.file ||
                      ""
                    }
                    alt={a.title}
                  />
                  <div>
                    <div className="font-medium text-foreground">{a.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.slug}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {TYPE_LABELS[a.type] || a.type}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {a.stars ? "★".repeat(a.stars) : "—"}
              </td>
              <td className="px-4 py-2">
                <Badge variant={a.is_published ? "default" : "secondary"}>
                  {a.is_published ? "Publicado" : "Borrador"}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(a)}
                    aria-label={`Editar ${a.title}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(a.slug)}
                    aria-label={`Eliminar ${a.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {accommodations.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-muted-foreground"
              >
                No hay alojamientos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
