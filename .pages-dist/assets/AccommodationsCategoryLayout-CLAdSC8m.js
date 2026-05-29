import {
  r as u,
  j as e,
  P as j,
  M as o,
  F as b,
  q as f,
  S as g,
  A as v,
  a as N,
  d as w,
  b as C,
  s as F,
} from "./index-ckc-OP1V.js";
function y({ category: a, places: t }) {
  var x, h;
  const [l, d] = u.useState("all"),
    c =
      ((x = a == null ? void 0 : a.featured_media) == null
        ? void 0
        : x.variant_large) ||
      ((h = a == null ? void 0 : a.featured_media) == null ? void 0 : h.file),
    i = t,
    m = l === "all" ? i : i.filter((s) => s.stars === l),
    p = i.reduce(
      (s, r) => (r.stars && (s[r.stars] = (s[r.stars] || 0) + 1), s),
      {},
    );
  return e.jsxs("main", {
    className: "min-h-screen bg-background-light page-shell-offset",
    "data-testid": "category-layout-accommodations",
    children: [
      e.jsx(j, {
        eyebrow: "Alojamiento",
        title: a.nombre,
        description: a.descripcion,
        tone: "immersive",
        breadcrumbs: [
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: a.nombre },
        ],
        metrics: [
          { label: "Alojamientos", value: i.length },
          { label: "Filtro", value: l === "all" ? "Todos" : `${l} estrellas` },
          { label: "Plan", value: "Dormir y desplazarte mejor" },
        ],
        media: c
          ? e.jsx("div", {
              className: "aspect-[4/3] overflow-hidden",
              children: e.jsx("img", {
                src: c,
                alt: a.nombre,
                className: "h-full w-full object-cover",
              }),
            })
          : void 0,
      }),
      e.jsxs("div", {
        className: "page-container space-y-10 py-10",
        children: [
          e.jsx(o, {
            children: e.jsx(b, {
              children: e.jsxs("div", {
                className: "flex flex-col gap-4",
                children: [
                  e.jsxs("div", {
                    className:
                      "flex items-center gap-2 text-sm font-semibold text-slate-900",
                    children: [
                      e.jsx(f, { className: "h-4 w-4 text-primary" }),
                      "Filtra por categoria de estrellas",
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex flex-wrap gap-2",
                    children: [
                      e.jsxs("button", {
                        onClick: () => d("all"),
                        className: `rounded-full px-4 py-2 text-sm font-semibold ${l === "all" ? "bg-primary text-white" : "bg-white text-slate-600"}`,
                        children: ["Todos (", t.length, ")"],
                      }),
                      [5, 4, 3, 2, 1].map((s) =>
                        p[s]
                          ? e.jsxs(
                              "button",
                              {
                                onClick: () => d(s),
                                className: `rounded-full px-4 py-2 text-sm font-semibold ${l === s ? "bg-primary text-white" : "bg-white text-slate-600"}`,
                                children: [s, " estrellas"],
                              },
                              s,
                            )
                          : null,
                      ),
                    ],
                  }),
                ],
              }),
            }),
          }),
          e.jsxs("section", {
            className: "space-y-6",
            children: [
              e.jsx(o, {
                children: e.jsx(g, {
                  eyebrow: "Dormir en Cabrera",
                  title: `${m.length} alojamientos disponibles`,
                  description:
                    "Un listado mas actual para hoteles, apartamentos y otros espacios donde alojarte.",
                }),
              }),
              e.jsx(v, {
                className:
                  "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10",
                children: m.map((s) => e.jsx(N, { place: s }, s.id)),
              }),
            ],
          }),
          t.length > 0
            ? e.jsx(o, {
                children: e.jsxs("div", {
                  className: "grid gap-6 md:grid-cols-3",
                  children: [
                    e.jsx(n, {
                      icon: w,
                      title: "Horarios tipicos",
                      text: "Check-in desde las 14:00 y salida hasta las 11:00, segun cada establecimiento.",
                    }),
                    e.jsx(n, {
                      icon: C,
                      title: "Ubicacion",
                      text: "Opciones bien conectadas para explorar el municipio y su entorno con comodidad.",
                    }),
                    e.jsx(n, {
                      icon: F,
                      title: "Reservas",
                      text: "Consulta cada ficha para contactar directamente o acceder al sistema de reserva.",
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
function n({ icon: a, title: t, text: l }) {
  return e.jsxs("div", {
    className: "card-surface p-7",
    children: [
      e.jsx(a, { className: "h-7 w-7 text-primary" }),
      e.jsx("h3", {
        className: "mt-4 text-lg font-semibold text-slate-900",
        children: t,
      }),
      e.jsx("p", { className: "mt-2 text-sm text-slate-600", children: l }),
    ],
  });
}
export { y as default };
