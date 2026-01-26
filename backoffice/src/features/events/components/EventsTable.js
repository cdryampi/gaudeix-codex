import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarClock, Edit, MapPin, Trash2 } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";
export function EventsTable({ events, onEdit, onDelete }) {
  return _jsx("div", {
    className:
      "w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm",
    children: _jsx(ScrollArea, {
      className: "w-full",
      children: _jsxs("table", {
        className: "w-full min-w-[820px] table-auto caption-bottom text-sm",
        children: [
          _jsx("thead", {
            className:
              "bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground",
            children: _jsxs("tr", {
              className:
                "[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold",
              children: [
                _jsx("th", { children: "Titulo" }),
                _jsx("th", { children: "Fechas" }),
                _jsx("th", { children: "Ubicacion" }),
                _jsx("th", { children: "Estado" }),
                _jsx("th", { className: "text-right", children: "Acciones" }),
              ],
            }),
          }),
          _jsx("tbody", {
            className: "divide-y divide-border",
            children:
              events.length === 0
                ? _jsx("tr", {
                    children: _jsx("td", {
                      colSpan: 5,
                      className: "p-6 text-center text-muted-foreground",
                      children: "No hay eventos creados.",
                    }),
                  })
                : events.map((event) =>
                    _jsxs(
                      "tr",
                      {
                        className: "transition-colors hover:bg-muted/30",
                        children: [
                          _jsx("td", {
                            className: "px-5 py-4 align-middle",
                            children: _jsxs("div", {
                              className: "flex items-start gap-3",
                              children: [
                                _jsx(EventThumbnail, { event: event }),
                                _jsxs("div", {
                                  className: "space-y-1",
                                  children: [
                                    _jsx("p", {
                                      className:
                                        "font-semibold text-foreground",
                                      children: event.title,
                                    }),
                                    _jsx("p", {
                                      className:
                                        "text-xs text-muted-foreground",
                                      children: event.slug,
                                    }),
                                    _jsxs("div", {
                                      className: "flex flex-wrap gap-1 pt-1",
                                      children: [
                                        (event.category_name ||
                                          event.category_slug) &&
                                          _jsx(Badge, {
                                            variant: "outline",
                                            children:
                                              event.category_name ||
                                              event.category_slug,
                                          }),
                                        event.is_featured &&
                                          _jsx(Badge, {
                                            variant: "secondary",
                                            children: "Destacado",
                                          }),
                                        event.is_free
                                          ? _jsx(Badge, {
                                              variant: "secondary",
                                              children: "Gratis",
                                            })
                                          : event.price_text
                                            ? _jsx(Badge, {
                                                variant: "outline",
                                                children: event.price_text,
                                              })
                                            : _jsx(Badge, {
                                                variant: "outline",
                                                children: "De pago",
                                              }),
                                        (event.tags || [])
                                          .slice(0, 2)
                                          .map((tag) =>
                                            _jsx(
                                              Badge,
                                              {
                                                variant: "outline",
                                                className:
                                                  "border-primary/20 bg-primary/10 text-primary",
                                                children: tag.nombre,
                                              },
                                              tag.id,
                                            ),
                                          ),
                                        (event.tags || []).length > 2 &&
                                          _jsxs(Badge, {
                                            variant: "outline",
                                            className:
                                              "border-primary/20 bg-primary/10 text-primary",
                                            children: [
                                              "+",
                                              (event.tags || []).length - 2,
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                          _jsx("td", {
                            className: "px-5 py-4 align-middle",
                            children: _jsxs("div", {
                              className:
                                "flex flex-col gap-1 text-sm text-foreground",
                              children: [
                                _jsxs("span", {
                                  className:
                                    "flex items-center gap-1 text-xs text-muted-foreground",
                                  children: [
                                    _jsx(CalendarClock, {
                                      className: "h-4 w-4",
                                    }),
                                    "Inicio",
                                  ],
                                }),
                                _jsx("span", {
                                  children: formatDate(event.start_at),
                                }),
                                event.end_at &&
                                  _jsxs("span", {
                                    className: "text-xs text-muted-foreground",
                                    children: [
                                      "Fin: ",
                                      formatDate(event.end_at),
                                    ],
                                  }),
                              ],
                            }),
                          }),
                          _jsx("td", {
                            className: "px-5 py-4 align-middle",
                            children: _jsxs("div", {
                              className:
                                "flex flex-col gap-1 text-sm text-foreground",
                              children: [
                                event.venue_name &&
                                  _jsx("span", {
                                    className:
                                      "text-xs font-medium text-foreground",
                                    children: event.venue_name,
                                  }),
                                _jsxs("div", {
                                  className:
                                    "flex items-center gap-2 text-sm text-foreground",
                                  children: [
                                    _jsx(MapPin, {
                                      className:
                                        "h-4 w-4 text-muted-foreground",
                                    }),
                                    _jsx("span", {
                                      className: "truncate",
                                      children:
                                        event.location_text || "Sin ubicacion",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                          _jsx("td", {
                            className: "px-5 py-4 align-middle",
                            children: event.is_published
                              ? _jsx(Badge, {
                                  className:
                                    "bg-primary/10 text-primary hover:bg-primary/10 border-primary/20",
                                  children: "Publicado",
                                })
                              : _jsx(Badge, {
                                  className:
                                    "bg-muted text-muted-foreground hover:bg-muted border-border",
                                  children: "Borrador",
                                }),
                          }),
                          _jsx("td", {
                            className: "px-5 py-4 align-middle text-right",
                            children: _jsxs("div", {
                              className: "flex justify-end gap-1",
                              children: [
                                _jsx(Button, {
                                  variant: "ghost",
                                  size: "icon",
                                  className:
                                    "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted",
                                  onClick: () => onEdit(event),
                                  "aria-label": `Editar ${event.title}`,
                                  children: _jsx(Edit, {
                                    className: "h-4 w-4",
                                  }),
                                }),
                                _jsx(Button, {
                                  variant: "ghost",
                                  size: "icon",
                                  className:
                                    "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                                  onClick: () => onDelete(event.id),
                                  "aria-label": `Eliminar ${event.title}`,
                                  children: _jsx(Trash2, {
                                    className: "h-4 w-4",
                                  }),
                                }),
                              ],
                            }),
                          }),
                        ],
                      },
                      event.id,
                    ),
                  ),
          }),
        ],
      }),
    }),
  });
}
function EventThumbnail({ event }) {
  return _jsx(MediaThumbnail, { src: getEventImage(event), alt: event.title });
}
function getEventImage(event) {
  return (
    event.featured_media?.thumbnail_url ||
    event.featured_media?.variant_thumbnail ||
    event.featured_media?.file ||
    event.image_url ||
    ""
  );
}
function formatDate(value) {
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
