import { Category } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
};

export function CategoriesTable({ categories, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Slug</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Nombre</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Taxonomía</th>
            <th className="px-4 py-2 text-right font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((cat) => (
            <tr key={cat.id} className="hover:bg-muted/40">
              <td className="px-4 py-2 font-medium text-foreground">{cat.slug}</td>
              <td className="px-4 py-2">
                <div className="font-medium">{cat.nombre}</div>
                {cat.descripcion && (
                  <div className="text-xs text-muted-foreground line-clamp-2">{cat.descripcion}</div>
                )}
              </td>
              <td className="px-4 py-2">
                {cat.taxonomy ? <Badge variant="secondary">{cat.taxonomy}</Badge> : <span>-</span>}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(cat)}
                    aria-label={`Editar ${cat.nombre}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(cat.id)}
                    aria-label={`Eliminar ${cat.nombre}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                No hay categorías.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
