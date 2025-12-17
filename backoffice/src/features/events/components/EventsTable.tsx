import { Event } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarClock, Edit, MapPin, Trash2 } from "lucide-react";

type Props = {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
};

export function EventsTable({ events, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[720px] table-auto caption-bottom text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Titulo</th>
              <th>Fechas</th>
              <th>Ubicacion</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No hay eventos creados.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-4 align-middle">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.slug}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(event.category_name || event.category_slug) && (
                          <Badge variant="outline">{event.category_name || event.category_slug}</Badge>
                        )}

                        {event.is_featured && <Badge variant="secondary">Destacado</Badge>}

                        {event.is_free ? (
                          <Badge variant="secondary">Gratis</Badge>
                        ) : event.price_text ? (
                          <Badge variant="outline">{event.price_text}</Badge>
                        ) : (
                          <Badge variant="outline">De pago</Badge>
                        )}

                        {(event.tags || []).slice(0, 2).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="border-primary/20 bg-primary/10 text-primary"
                          >
                            {tag.nombre}
                          </Badge>
                        ))}
                        {(event.tags || []).length > 2 && (
                          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                            +{(event.tags || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="flex flex-col gap-1 text-sm text-foreground">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="h-4 w-4" />
                        Inicio
                      </span>
                      <span>{formatDate(event.start_at)}</span>
                      {event.end_at && (
                        <span className="text-xs text-muted-foreground">Fin: {formatDate(event.end_at)}</span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="flex flex-col gap-1 text-sm text-foreground">
                      {event.venue_name && (
                        <span className="text-xs font-medium text-foreground">{event.venue_name}</span>
                      )}
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{event.location_text || "Sin ubicacion"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {event.is_published ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted border-border">Borrador</Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => onEdit(event)}
                        aria-label={`Editar ${event.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(event.id)}
                        aria-label={`Eliminar ${event.title}`}
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

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
