import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";
import type { Restaurant } from "../types";

const CUISINE_LABELS: Record<string, string> = {
  mediterranean: "Mediterránea",
  italian: "Italiana",
  asian: "Asiática",
  fast_food: "Fast food",
  traditional: "Tradicional",
  tapas: "Tapas",
  vegan: "Vegana",
  other: "Otra",
};

type Props = {
  restaurants: Restaurant[];
  onEdit: (r: Restaurant) => void;
  onDelete: (slug: string) => void;
};

export function RestaurantsTable({ restaurants, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Título
            </th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Tipo cocina
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
          {restaurants.map((r) => (
            <tr key={r.id} className="hover:bg-muted/40">
              <td className="px-4 py-2">
                <div className="flex items-start gap-3">
                  <MediaThumbnail
                    src={
                      r.featured_media?.thumbnail_url ||
                      r.featured_media?.variant_thumbnail ||
                      r.featured_media?.file ||
                      ""
                    }
                    alt={r.title}
                  />
                  <div>
                    <div className="font-medium text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.slug}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {CUISINE_LABELS[r.cuisine_type] || r.cuisine_type}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {r.location_text || `${r.latitude ?? ""} ${r.longitude ?? ""}`}
              </td>
              <td className="px-4 py-2">
                <Badge variant={r.is_published ? "default" : "secondary"}>
                  {r.is_published ? "Publicado" : "Borrador"}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(r)}
                    aria-label={`Editar ${r.title}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(r.slug)}
                    aria-label={`Eliminar ${r.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {restaurants.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-muted-foreground"
              >
                No hay restaurantes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
