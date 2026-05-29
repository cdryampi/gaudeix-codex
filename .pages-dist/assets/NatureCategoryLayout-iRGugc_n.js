import {
  r as h,
  j as e,
  P as f,
  M as d,
  F as N,
  G as v,
  e as y,
  L as w,
  f as _,
  S as n,
  A as b,
  a as C,
  T as k,
} from "./index-ckc-OP1V.js";
function P({ category: s, places: l, isLoadingPlaces: j }) {
  var u, p;
  const [t, c] = h.useState("grid"),
    [o, m] = h.useState(null),
    x =
      ((u = s == null ? void 0 : s.featured_media) == null
        ? void 0
        : u.variant_large) ||
      ((p = s == null ? void 0 : s.featured_media) == null ? void 0 : p.file),
    g = l
      .filter((a) => {
        var r, i;
        return (
          ((r = a.featured_media) == null ? void 0 : r.variant_large) ||
          ((i = a.featured_media) == null ? void 0 : i.file)
        );
      })
      .map((a) => {
        var r, i;
        return {
          url:
            ((r = a.featured_media) == null ? void 0 : r.variant_large) ||
            ((i = a.featured_media) == null ? void 0 : i.file) ||
            "",
          title: a.title,
        };
      });
  return e.jsxs("main", {
    className: "min-h-screen bg-background-light page-shell-offset",
    "data-testid": "category-layout-nature",
    children: [
      e.jsx(f, {
        eyebrow: "Naturaleza y territorio",
        title: s.nombre,
        description: s.descripcion,
        tone: "immersive",
        breadcrumbs: [
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: s.nombre },
        ],
        metrics: [
          { label: "Lugares", value: l.length },
          {
            label: "Vista activa",
            value: t === "grid" ? "Recorrido" : "Galeria",
          },
          { label: "Plan", value: "Explora y abre mapa" },
        ],
        media: x
          ? e.jsx("div", {
              className: "aspect-[4/3] overflow-hidden",
              children: e.jsx("img", {
                src: x,
                alt: s.nombre,
                className: "h-full w-full object-cover",
              }),
            })
          : void 0,
      }),
      e.jsxs("div", {
        className: "page-container space-y-10 py-10",
        children: [
          e.jsx(d, {
            children: e.jsx(N, {
              children: e.jsxs("div", {
                className:
                  "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("p", {
                        className: "text-sm font-semibold text-slate-900",
                        children: "Recorre el entorno a tu ritmo",
                      }),
                      e.jsx("p", {
                        className: "text-sm text-slate-500",
                        children:
                          "Alterna entre una lectura tipo guia y una galeria visual para inspirarte antes de la visita.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex items-center gap-3",
                    children: [
                      e.jsxs("div", {
                        className:
                          "flex items-center gap-2 rounded-full bg-slate-100 p-1",
                        children: [
                          e.jsx("button", {
                            onClick: () => c("grid"),
                            className: `rounded-full px-4 py-2 text-sm font-semibold ${t === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`,
                            children: e.jsxs("span", {
                              className: "inline-flex items-center gap-2",
                              children: [
                                e.jsx(v, { className: "h-4 w-4" }),
                                "Recorrido",
                              ],
                            }),
                          }),
                          e.jsx("button", {
                            onClick: () => c("gallery"),
                            className: `rounded-full px-4 py-2 text-sm font-semibold ${t === "gallery" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`,
                            children: e.jsxs("span", {
                              className: "inline-flex items-center gap-2",
                              children: [
                                e.jsx(y, { className: "h-4 w-4" }),
                                "Galeria",
                              ],
                            }),
                          }),
                        ],
                      }),
                      e.jsxs(w, {
                        to: `/categorias/${s.slug}`,
                        className:
                          "inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary",
                        children: [
                          e.jsx(_, { className: "h-4 w-4" }),
                          "Ver mapa",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
          e.jsxs("section", {
            className: "space-y-6",
            children: [
              e.jsx(d, {
                children: e.jsx(n, {
                  eyebrow: "Explora",
                  title:
                    t === "grid"
                      ? `${l.length} lugares para descubrir`
                      : "Galeria inspiracional",
                  description:
                    "Una plantilla mas luminosa y ordenada para patrimonio, naturaleza y recorridos de descubrimiento.",
                }),
              }),
              t === "grid"
                ? e.jsx(b, {
                    className:
                      "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10",
                    children: l.map((a) => e.jsx(C, { place: a }, a.id)),
                  })
                : e.jsx(b, {
                    className:
                      "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:gap-8",
                    children: g.map((a) =>
                      e.jsxs(
                        "button",
                        {
                          "data-animated-card": !0,
                          onClick: () => m(a.url),
                          className:
                            "group relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/70 bg-slate-200 shadow-[0_14px_40px_rgba(14,42,66,0.12)]",
                          children: [
                            e.jsx("img", {
                              src: a.url,
                              alt: a.title,
                              className:
                                "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
                            }),
                            e.jsx("div", {
                              className:
                                "absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,24,37,0.65))]",
                            }),
                            e.jsx("div", {
                              className:
                                "absolute inset-x-0 bottom-0 p-4 text-left",
                              children: e.jsx("p", {
                                className: "text-sm font-semibold text-white",
                                children: a.title,
                              }),
                            }),
                          ],
                        },
                        a.url,
                      ),
                    ),
                  }),
            ],
          }),
          s.slug === "beaches"
            ? e.jsx(d, {
                children:
                  l.length === 2
                    ? e.jsxs("section", {
                        className: "card-surface space-y-6 p-6 md:p-8",
                        children: [
                          e.jsx(n, {
                            eyebrow: "Comparativa",
                            title: "Compara las dos playas publicadas",
                            description:
                              "Vista rapida para decidir cual visitar segun ubicacion y contacto disponible.",
                          }),
                          e.jsx("div", {
                            className: "overflow-x-auto",
                            children: e.jsxs("table", {
                              className:
                                "min-w-full text-left text-sm text-slate-700",
                              children: [
                                e.jsx("thead", {
                                  children: e.jsxs("tr", {
                                    className:
                                      "border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500",
                                    children: [
                                      e.jsx("th", {
                                        className: "px-3 py-3",
                                        children: "Playa",
                                      }),
                                      e.jsx("th", {
                                        className: "px-3 py-3",
                                        children: "Ubicacion",
                                      }),
                                      e.jsx("th", {
                                        className: "px-3 py-3",
                                        children: "Telefono",
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsx("tbody", {
                                  children: l.map((a) =>
                                    e.jsxs(
                                      "tr",
                                      {
                                        className:
                                          "border-b border-slate-100 last:border-b-0",
                                        children: [
                                          e.jsx("td", {
                                            className:
                                              "px-3 py-3 font-semibold text-slate-900",
                                            children: a.title,
                                          }),
                                          e.jsx("td", {
                                            className: "px-3 py-3",
                                            children: a.location_text,
                                          }),
                                          e.jsx("td", {
                                            className: "px-3 py-3",
                                            children: a.phone || "-",
                                          }),
                                        ],
                                      },
                                      a.id,
                                    ),
                                  ),
                                }),
                              ],
                            }),
                          }),
                        ],
                      })
                    : e.jsx("section", {
                        className: "card-surface space-y-4 p-6 md:p-8",
                        children: e.jsx(n, {
                          eyebrow: "Seleccion editorial",
                          title:
                            "El equipo municipal destaca las mejores opciones para hoy",
                          description:
                            "Cuando hay mas o menos de dos playas publicadas, mostramos una narrativa editorial en lugar de forzar una comparativa.",
                        }),
                      }),
              })
            : null,
          l.length === 0 && !j
            ? e.jsxs("div", {
                className: "py-24 text-center",
                children: [
                  e.jsx(k, {
                    className: "mx-auto mb-6 h-16 w-16 text-slate-300",
                  }),
                  e.jsx("p", {
                    className: "text-xl font-bold text-slate-400",
                    children: "No hay lugares en esta categoria todavia.",
                  }),
                ],
              })
            : null,
        ],
      }),
      o
        ? e.jsx("div", {
            className:
              "fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/92 p-8",
            onClick: () => m(null),
            children: e.jsx("img", {
              src: o,
              alt: "",
              className: "max-h-full max-w-full rounded-2xl object-contain",
            }),
          })
        : null,
    ],
  });
}
export { P as default };
