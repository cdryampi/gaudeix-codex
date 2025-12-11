import { StaticPage } from "../types";
import { TEMPLATE_LABEL_MAP } from "../constants/templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, File, Image as ImageIcon } from "lucide-react";

type Props = {
  pages: StaticPage[];
  onEdit: (page: StaticPage) => void;
  onDelete: (id: number) => void;
};

export function StaticPagesTable({ pages, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Slug</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Plantilla</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Título</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Publicado</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Media</th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">Documento</th>
            <th className="px-4 py-2 text-right font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {pages.map((page) => (
            <tr key={page.id} className="hover:bg-muted/40">
              <td className="px-4 py-2 font-medium text-foreground">{page.slug}</td>
              <td className="px-4 py-2">
                <div className="flex flex-col">
                  <span className="font-medium">{TEMPLATE_LABEL_MAP[page.template] || page.template}</span>
                  <span className="text-xs text-muted-foreground">{page.template}</span>
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="font-medium">{page.titulo}</div>
                {page.cuerpo && <div className="text-xs text-muted-foreground line-clamp-2">{page.cuerpo}</div>}
              </td>
              <td className="px-4 py-2">
                {page.is_published ? <Badge>Publicado</Badge> : <Badge variant="secondary">Borrador</Badge>}
              </td>
              <td className="px-4 py-2">
                {page.featured_media ? (
                  <div className="flex items-center gap-1 text-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-xs">{page.featured_media.original_name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </td>
              <td className="px-4 py-2">
                {page.attachment ? (
                  <div className="flex items-center gap-1 text-foreground">
                    <File className="h-4 w-4" />
                    <span className="text-xs">{page.attachment.original_name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => onEdit(page)}
                    aria-label={`Editar ${page.slug}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(page.id)}
                    aria-label={`Eliminar ${page.slug}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {pages.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                No hay páginas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
