import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Place } from "../types";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  places: Place[];
  onEdit: (place: Place) => void;
  onDelete: (id: number) => void;
};

export function PlacesTable({ places, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Título</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Categoría</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Ubicación</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Estado</th>
            <th className="px-4 py-2 text-right font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {places.map((place) => (
            <tr key={place.id} className="hover:bg-muted/40">
              <td className="px-4 py-2 font-medium text-foreground">{place.title}</td>
              <td className="px-4 py-2 text-muted-foreground">
                {place.template_key || place.category || "-"}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {place.location_text || `${place.latitude ?? ""} ${place.longitude ?? ""}`}
              </td>
              <td className="px-4 py-2">
                <Badge variant={place.is_published ? "default" : "secondary"}>
                  {place.is_published ? "Publicado" : "Borrador"}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(place)}
                    aria-label={`Editar ${place.title}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(place.id)}
                    aria-label={`Eliminar ${place.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {places.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                No hay lugares.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
