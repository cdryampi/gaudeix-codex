import {
  j as e,
  P as g,
  M as r,
  S as o,
  A as n,
  a as m,
  E as x,
  L as u,
  D as t,
  b as h,
  C as p,
} from "./index-ckc-OP1V.js";
function j({
  category: l,
  places: a,
  events: s,
  isLoadingPlaces: c,
  isLoadingEvents: d,
}) {
  return e.jsxs("main", {
    className: "min-h-screen bg-background-light page-shell-offset",
    "data-testid": "category-layout-default",
    children: [
      e.jsx(g, {
        eyebrow: "Categoria publica",
        title: l.nombre,
        description: l.descripcion,
        tone: "immersive",
        breadcrumbs: [
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: l.nombre },
        ],
        metrics: [
          { label: "Lugares", value: a.length },
          { label: "Eventos", value: s.length },
          { label: "Tema", value: "Exploracion publica" },
        ],
      }),
      e.jsxs("div", {
        className: "page-container space-y-14 py-10",
        children: [
          a.length > 0
            ? e.jsxs("section", {
                className: "space-y-6",
                children: [
                  e.jsx(r, {
                    children: e.jsx(o, {
                      eyebrow: "Lugares",
                      title: `Espacios relacionados con ${l.nombre}`,
                      description:
                        "Una seleccion de puntos de interes vinculados a esta categoria.",
                    }),
                  }),
                  e.jsx(n, {
                    className:
                      "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10",
                    children: a.map((i) => e.jsx(m, { place: i }, i.id)),
                  }),
                ],
              })
            : null,
          s.length > 0
            ? e.jsxs("section", {
                className: "space-y-6",
                children: [
                  e.jsx(r, {
                    children: e.jsx(o, {
                      eyebrow: "Agenda",
                      title: `Eventos vinculados a ${l.nombre}`,
                      description:
                        "Actividades y propuestas publicas asociadas a esta categoria.",
                    }),
                  }),
                  e.jsx(n, {
                    className:
                      "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10",
                    children: s.map((i) => e.jsx(x, { event: i }, i.id)),
                  }),
                ],
              })
            : null,
          a.length === 0 && s.length === 0 && !c && !d
            ? e.jsxs("div", {
                className:
                  "card-surface flex flex-col items-center justify-center gap-4 py-20 text-center",
                children: [
                  e.jsx("p", {
                    className: "text-xl font-semibold text-slate-500",
                    children:
                      "No hay contenido disponible en esta categoria todavia.",
                  }),
                  e.jsx(u, {
                    to: "/categorias",
                    className:
                      "rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary",
                    children: "Volver a categorias",
                  }),
                ],
              })
            : null,
          a.length > 0 || s.length > 0
            ? e.jsx(r, {
                children: e.jsxs("div", {
                  className: "grid gap-4 md:grid-cols-2",
                  children: [
                    e.jsx(t, {
                      label: "Lugares relacionados",
                      value: a.length,
                      icon: h,
                    }),
                    e.jsx(t, {
                      label: "Eventos relacionados",
                      value: s.length,
                      icon: p,
                    }),
                  ],
                }),
              })
            : null,
        ],
      }),
    ],
  });
}
export { j as default };
