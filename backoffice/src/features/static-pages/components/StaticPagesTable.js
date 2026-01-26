import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TEMPLATE_LABEL_MAP } from "../constants/templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, File } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";
export function StaticPagesTable({ pages, onEdit, onDelete }) {
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
                children: "P\u00E1gina",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "Plantilla",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "T\u00EDtulo",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "Publicado",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "Media",
              }),
              _jsx("th", {
                className: "px-4 py-2 text-left font-semibold text-foreground",
                children: "Documento",
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
            pages.map((page) =>
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
                          _jsx(MediaThumbnail, {
                            src:
                              page.featured_media?.thumbnail_url ||
                              page.featured_media?.variant_thumbnail ||
                              page.featured_media?.file ||
                              "",
                            alt: page.titulo,
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("div", {
                                className: "font-medium text-foreground",
                                children: page.slug,
                              }),
                              _jsxs("div", {
                                className: "text-xs text-muted-foreground",
                                children: ["ID ", page.id],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    _jsx("td", {
                      className: "px-4 py-2",
                      children: _jsxs("div", {
                        className: "flex flex-col",
                        children: [
                          _jsx("span", {
                            className: "font-medium",
                            children:
                              TEMPLATE_LABEL_MAP[page.template] ||
                              page.template,
                          }),
                          _jsx("span", {
                            className: "text-xs text-muted-foreground",
                            children: page.template,
                          }),
                        ],
                      }),
                    }),
                    _jsxs("td", {
                      className: "px-4 py-2",
                      children: [
                        _jsx("div", {
                          className: "font-medium",
                          children: page.titulo,
                        }),
                        page.cuerpo &&
                          _jsx("div", {
                            className:
                              "text-xs text-muted-foreground line-clamp-2",
                            children: page.cuerpo,
                          }),
                      ],
                    }),
                    _jsx("td", {
                      className: "px-4 py-2",
                      children: page.is_published
                        ? _jsx(Badge, { children: "Publicado" })
                        : _jsx(Badge, {
                            variant: "secondary",
                            children: "Borrador",
                          }),
                    }),
                    _jsx("td", {
                      className: "px-4 py-2",
                      children: page.featured_media
                        ? _jsx("span", {
                            className: "text-xs text-foreground",
                            children: page.featured_media.original_name,
                          })
                        : _jsx("span", {
                            className: "text-muted-foreground text-xs",
                            children: "-",
                          }),
                    }),
                    _jsx("td", {
                      className: "px-4 py-2",
                      children: page.attachment
                        ? _jsxs("div", {
                            className:
                              "flex items-center gap-2 text-foreground",
                            children: [
                              _jsx("span", {
                                className:
                                  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-muted/30",
                                children: _jsx(File, { className: "h-4 w-4" }),
                              }),
                              _jsxs("div", {
                                className: "text-xs",
                                children: [
                                  _jsx("div", {
                                    className: "font-medium",
                                    children: page.attachment.original_name,
                                  }),
                                  _jsx("div", {
                                    className: "text-muted-foreground",
                                    children: "Documento adjunto",
                                  }),
                                ],
                              }),
                            ],
                          })
                        : _jsx("span", {
                            className: "text-muted-foreground text-xs",
                            children: "-",
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
                            onClick: () => onEdit(page),
                            "aria-label": `Editar ${page.slug}`,
                            children: _jsx(Edit, { className: "h-4 w-4" }),
                          }),
                          _jsx(Button, {
                            variant: "ghost",
                            size: "icon",
                            className:
                              "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                            onClick: () => onDelete(page.id),
                            "aria-label": `Eliminar ${page.slug}`,
                            children: _jsx(Trash2, { className: "h-4 w-4" }),
                          }),
                        ],
                      }),
                    }),
                  ],
                },
                page.id,
              ),
            ),
            pages.length === 0 &&
              _jsx("tr", {
                children: _jsx("td", {
                  colSpan: 7,
                  className: "px-4 py-6 text-center text-muted-foreground",
                  children: "No hay p\u00E1ginas.",
                }),
              }),
          ],
        }),
      ],
    }),
  });
}
