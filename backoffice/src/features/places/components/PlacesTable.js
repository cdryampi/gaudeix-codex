import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";
export function PlacesTable({ places, onEdit, onDelete }) {
  return _jsx("div", {
    className: "overflow-x-auto",
    children: _jsxs("table", {
      className: "min-w-full divide-y divide-border text-sm",
      children: [
        _jsx("thead", {
          className: "bg-muted/50",
          children: _jsxs("tr", {
            children: [
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "T\u00EDtulo",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "Categor\u00EDa",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "Ubicaci\u00F3n",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "Estado",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-right font-semibold text-foreground",
                children: "Acciones",
              }),
            ],
          }),
        }),
        _jsxs("tbody", {
          className: "divide-y divide-border",
          children: [
            places.map((place) =>
              _jsxs(
                "tr",
                {
                  className: "hover:bg-muted/40",
                  children: [
                    _jsx("td", {
                      className: "px-4 py-2",
                      children: _jsxs("div", {
                        className: "flex items-start gap-3",
                        children: [
                          _jsx(PlaceThumbnail, { place: place }),
                          _jsxs("div", {
                            children: [
                              _jsx("div", {
                                className: "font-medium text-foreground",
                                children: place.title,
                              }),
                              _jsx("div", {
                                className: "text-xs text-muted-foreground",
                                children: place.slug,
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    _jsx("td", {
                      className: "px-4 py-2 text-muted-foreground",
                      children: place.template_key || place.category || "-",
                    }),
                    _jsx("td", {
                      className: "px-4 py-2 text-muted-foreground",
                      children:
                        place.location_text ||
                        `${place.latitude ?? ""} ${place.longitude ?? ""}`,
                    }),
                    _jsx("td", {
                      className: "px-4 py-2",
                      children: _jsx(Badge, {
                        variant: place.is_published ? "default" : "secondary",
                        children: place.is_published ? "Publicado" : "Borrador",
                      }),
                    }),
                    _jsx("td", {
                      className: "px-4 py-2 text-right",
                      children: _jsxs("div", {
                        className: "flex justify-end gap-1",
                        children: [
                          _jsx(Button, {
                            variant: "ghost",
                            size: "icon",
                            className:
                              "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted",
                            onClick: () => onEdit(place),
                            "aria-label": `Editar ${place.title}`,
                            children: _jsx(Edit, { className: "h-4 w-4" }),
                          }),
                          _jsx(Button, {
                            variant: "ghost",
                            size: "icon",
                            className:
                              "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                            onClick: () => onDelete(place.id),
                            "aria-label": `Eliminar ${place.title}`,
                            children: _jsx(Trash2, { className: "h-4 w-4" }),
                          }),
                        ],
                      }),
                    }),
                  ],
                },
                place.id,
              ),
            ),
            places.length === 0 &&
              _jsx("tr", {
                children: _jsx("td", {
                  colSpan: 5,
                  className: "px-4 py-6 text-center text-muted-foreground",
                  children: "No hay lugares.",
                }),
              }),
          ],
        }),
      ],
    }),
  });
}
function PlaceThumbnail({ place }) {
  const src =
    place.featured_media?.thumbnail_url ||
    place.featured_media?.variant_thumbnail ||
    place.featured_media?.file ||
    "";
  return _jsx(MediaThumbnail, { src: src, alt: place.title });
}
