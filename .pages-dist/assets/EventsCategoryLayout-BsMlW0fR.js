import {
  r as u,
  j as e,
  P as j,
  M as b,
  F as w,
  c as N,
  H as v,
  d as C,
  S as E,
  L as y,
  C as f,
  A as _,
  E as D,
} from "./index-ckc-OP1V.js";
function T({ category: a, events: i }) {
  var g, h;
  const [t, r] = u.useState("upcoming"),
    p =
      ((g = a == null ? void 0 : a.featured_media) == null
        ? void 0
        : g.variant_large) ||
      ((h = a == null ? void 0 : a.featured_media) == null ? void 0 : h.file),
    { upcomingEvents: o, pastEvents: x } = u.useMemo(() => {
      const n = new Date(),
        c = [],
        d = [];
      return (
        i.forEach((s) => {
          const l = s.start_at ? new Date(s.start_at) : null;
          l && l >= n ? c.push(s) : d.push(s);
        }),
        c.sort(
          (s, l) =>
            new Date(s.start_at || 0).getTime() -
            new Date(l.start_at || 0).getTime(),
        ),
        d.sort(
          (s, l) =>
            new Date(l.start_at || 0).getTime() -
            new Date(s.start_at || 0).getTime(),
        ),
        { upcomingEvents: c, pastEvents: d }
      );
    }, [i]),
    m = t === "upcoming" ? o : t === "past" ? x : i;
  return e.jsxs("main", {
    className: "min-h-screen bg-background-light page-shell-offset",
    "data-testid": "category-layout-events",
    children: [
      e.jsx(j, {
        eyebrow: "Agenda tematizada",
        title: a.nombre,
        description: a.descripcion,
        tone: "immersive",
        breadcrumbs: [
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: a.nombre },
        ],
        metrics: [
          { label: "Total eventos", value: i.length },
          { label: "Proximos", value: o.length },
          {
            label: "Filtro",
            value:
              t === "upcoming"
                ? "Proximos"
                : t === "past"
                  ? "Pasados"
                  : "Todos",
          },
        ],
        media: p
          ? e.jsx("div", {
              className: "aspect-[4/3] overflow-hidden",
              children: e.jsx("img", {
                src: p,
                alt: a.nombre,
                className: "h-full w-full object-cover",
              }),
            })
          : void 0,
      }),
      e.jsxs("div", {
        className: "page-container space-y-10 py-10",
        children: [
          e.jsx(b, {
            children: e.jsx(w, {
              children: e.jsxs("div", {
                className: "flex flex-wrap gap-3",
                children: [
                  e.jsxs("button", {
                    onClick: () => r("upcoming"),
                    className: `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${t === "upcoming" ? "bg-primary text-white" : "bg-white text-slate-600"}`,
                    children: [
                      e.jsx(N, { className: "h-4 w-4" }),
                      "Proximos (",
                      o.length,
                      ")",
                    ],
                  }),
                  e.jsxs("button", {
                    onClick: () => r("past"),
                    className: `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${t === "past" ? "bg-primary text-white" : "bg-white text-slate-600"}`,
                    children: [
                      e.jsx(v, { className: "h-4 w-4" }),
                      "Pasados (",
                      x.length,
                      ")",
                    ],
                  }),
                  e.jsxs("button", {
                    onClick: () => r("all"),
                    className: `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${t === "all" ? "bg-primary text-white" : "bg-white text-slate-600"}`,
                    children: [
                      e.jsx(C, { className: "h-4 w-4" }),
                      "Todos (",
                      i.length,
                      ")",
                    ],
                  }),
                ],
              }),
            }),
          }),
          e.jsxs("section", {
            className: "space-y-6",
            children: [
              e.jsx(b, {
                children: e.jsx(E, {
                  eyebrow: "Programacion",
                  title: `${m.length} eventos en esta categoria`,
                  description:
                    "Una plantilla mas editorial para navegar la agenda tematica del municipio.",
                  action: e.jsxs(y, {
                    to: "/agenda",
                    className:
                      "inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-4 py-2 text-sm font-semibold text-primary",
                    children: [
                      e.jsx(f, { className: "h-4 w-4" }),
                      "Ver agenda completa",
                    ],
                  }),
                }),
              }),
              m.length
                ? e.jsx(_, {
                    className:
                      "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10",
                    children: m.map((n) => e.jsx(D, { event: n }, n.id)),
                  })
                : e.jsxs("div", {
                    className: "py-24 text-center",
                    children: [
                      e.jsx(f, {
                        className: "mx-auto mb-6 h-16 w-16 text-slate-300",
                      }),
                      e.jsx("p", {
                        className: "text-xl font-bold text-slate-400",
                        children:
                          "No hay eventos en esta categoria para el filtro actual.",
                      }),
                    ],
                  }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { T as default };
