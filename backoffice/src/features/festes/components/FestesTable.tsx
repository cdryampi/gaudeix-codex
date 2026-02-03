/**
 * Festes table component.
 */
import { Festa } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2, Calendar, Star } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";

type Props = {
  festes: Festa[];
  onEdit: (festa: Festa) => void;
  onDelete: (slug: string) => void;
};

export function FestesTable({ festes, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[820px] table-auto caption-bottom text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Título</th>
              <th>Año</th>
              <th>Fechas</th>
              <th>Eventos</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {festes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-muted-foreground"
                >
                  No hay festes creadas.
                </td>
              </tr>
            ) : (
              festes.map((festa) => (
                <tr
                  key={festa.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-start gap-3">
                      <FestaThumbnail festa={festa} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {festa.title}
                          </p>
                          {festa.is_current && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200"
                            >
                              <Star className="mr-1 h-3 w-3 fill-amber-500" />
                              Actual
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {festa.slug}
                        </p>
                        {festa.subtitle && (
                          <p className="text-xs text-muted-foreground">
                            {festa.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <span className="text-lg font-bold">{festa.year}</span>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span>{formatDate(festa.start_date)}</span>
                        <span className="mx-1 text-muted-foreground">→</span>
                        <span>{formatDate(festa.end_date)}</span>
                      </div>
                    </div>
                    {festa.duration_days && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {festa.duration_days} días
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <Badge variant="outline">
                      {festa.events_count ?? 0} eventos
                    </Badge>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {festa.is_published ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                        Publicada
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted border-border">
                        Borrador
                      </Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => onEdit(festa)}
                        aria-label={`Editar ${festa.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(festa.slug)}
                        aria-label={`Eliminar ${festa.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

function FestaThumbnail({ festa }: { festa: Festa }) {
  const src =
    festa.poster?.thumbnail_url ||
    festa.poster?.file ||
    festa.featured_media?.thumbnail_url ||
    festa.featured_media?.file ||
    festa.image_url ||
    "";
  return <MediaThumbnail src={src} alt={festa.title} />;
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
