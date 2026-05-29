import {
  r as u,
  j as e,
  P as f,
  M as r,
  F as b,
  q as j,
  S as g,
  A as v,
  a as N,
  d as y,
  s as w,
  t as C,
} from "./index-ckc-OP1V.js";
function P({ category: a, places: i }) {
  var m, x;
  const [t, o] = u.useState("all"),
    c =
      ((m = a == null ? void 0 : a.featured_media) == null
        ? void 0
        : m.variant_large) ||
      ((x = a == null ? void 0 : a.featured_media) == null ? void 0 : x.file),
    l = i,
    h = u.useMemo(() => {
      const s = new Set();
      return (
        l.forEach((p) => {
          p.cuisine_type && s.add(p.cuisine_type);
        }),
        Array.from(s).sort()
      );
    }, [l]),
    d = t === "all" ? l : l.filter((s) => s.cuisine_type === t);
  return e.jsxs("main", {
    className: "min-h-screen bg-background-light page-shell-offset",
    "data-testid": "category-layout-restaurants",
    children: [
      e.jsx(f, {
        eyebrow: "Gastronomia local",
        title: a.nombre,
        description: a.descripcion,
        tone: "immersive",
        breadcrumbs: [
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: a.nombre },
        ],
        metrics: [
          { label: "Restaurantes", value: l.length },
          { label: "Filtro", value: t === "all" ? "Todos" : t },
          { label: "Experiencia", value: "Comer, reservar y descubrir" },
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
          e.jsx(r, {
            children: e.jsx(b, {
              children: e.jsxs("div", {
                className: "flex flex-col gap-4",
                children: [
                  e.jsxs("div", {
                    className:
                      "flex items-center gap-2 text-sm font-semibold text-slate-900",
                    children: [
                      e.jsx(j, { className: "h-4 w-4 text-primary" }),
                      "Filtra por tipo de cocina",
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex flex-wrap gap-2",
                    children: [
                      e.jsxs("button", {
                        onClick: () => o("all"),
                        className: `rounded-full px-4 py-2 text-sm font-semibold ${t === "all" ? "bg-primary text-white" : "bg-white text-slate-600"}`,
                        children: ["Todos (", l.length, ")"],
                      }),
                      h.map((s) =>
                        e.jsx(
                          "button",
                          {
                            onClick: () => o(s),
                            className: `rounded-full px-4 py-2 text-sm font-semibold capitalize ${t === s ? "bg-primary text-white" : "bg-white text-slate-600"}`,
                            children: s,
                          },
                          s,
                        ),
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
              e.jsx(r, {
                children: e.jsx(g, {
                  eyebrow: "Sabores del municipio",
                  title: `${d.length} propuestas para comer en Cabrera de Mar`,
                  description:
                    "Una plantilla mas ligera y alegre para gastronomia, manteniendo datos utiles y acceso directo a cada ficha.",
                }),
              }),
              e.jsx(v, {
                className:
                  "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10",
                children: d.map((s) => e.jsx(N, { place: s }, s.id)),
              }),
            ],
          }),
          i.length > 0
            ? e.jsx(r, {
                children: e.jsxs("div", {
                  className: "grid gap-6 md:grid-cols-3",
                  children: [
                    e.jsx(n, {
                      icon: y,
                      title: "Horarios tipicos",
                      text: "Comidas 13:00 - 16:00 y cenas 20:00 - 23:00 según establecimiento.",
                    }),
                    e.jsx(n, {
                      icon: w,
                      title: "Reservas",
                      text: "Conviene reservar con antelacion durante fines de semana y fechas señaladas.",
                    }),
                    e.jsx(n, {
                      icon: C,
                      title: "Precios orientativos",
                      text: "Consulta cada ficha para ver web, contacto y detalles del establecimiento.",
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
function n({ icon: a, title: i, text: t }) {
  return e.jsxs("div", {
    className: "card-surface p-7",
    children: [
      e.jsx(a, { className: "h-7 w-7 text-primary" }),
      e.jsx("h3", {
        className: "mt-4 text-lg font-semibold text-slate-900",
        children: i,
      }),
      e.jsx("p", { className: "mt-2 text-sm text-slate-600", children: t }),
    ],
  });
}
export { P as default };
