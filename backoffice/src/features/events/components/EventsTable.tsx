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
    <div className="w-full overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[720px] table-auto caption-bottom text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Título</th>
              <th>Fechas</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  No hay eventos creados.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr
                  key={event.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.slug}
                      </p>
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
                        <span className="text-xs text-muted-foreground">
                          Fin: {formatDate(event.end_at)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {event.location_text || "Sin ubicación"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    {event.is_published ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-200">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Borrador
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200"
                        onClick={() => onEdit(event)}
                        aria-label={`Editar ${event.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/30"
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
