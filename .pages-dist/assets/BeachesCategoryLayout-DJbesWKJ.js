import {
  u as T,
  r as k,
  j as e,
  P,
  L as x,
  f as $,
  N as M,
  M as m,
  I as O,
  g as E,
  h as D,
  W as L,
  R as q,
  S as B,
  A as z,
  i as H,
  k as F,
  l as R,
  m as f,
  B as u,
  n as j,
  o as v,
  p as V,
} from "./index-ckc-OP1V.js";
function Y({ category: a, places: t, isLoadingPlaces: s }) {
  var N, _, w, C, A, S;
  const { data: i, isLoading: r } = T({
      queryKey: ["beaches", "category-layout"],
      queryFn: () => V({ is_published: !0 }),
    }),
    l = k.useMemo(
      () => (i ? (Array.isArray(i) ? i : i.results) : t || []),
      [i, t],
    ),
    d =
      ((N = a.featured_media) == null ? void 0 : N.variant_large) ||
      ((_ = a.featured_media) == null ? void 0 : _.file) ||
      ((C = (w = l[0]) == null ? void 0 : w.featured_media) == null
        ? void 0
        : C.variant_large) ||
      ((S = (A = l[0]) == null ? void 0 : A.featured_media) == null
        ? void 0
        : S.file),
    o = l.length,
    p = o === 2,
    I = l.reduce(
      (n, h) => n + Object.values(h.services || {}).filter(Boolean).length,
      0,
    ),
    y = l.reduce(
      (n, h) =>
        n +
        Object.values(h.accessibility_features || {}).filter(Boolean).length,
      0,
    );
  return e.jsxs("main", {
    className: "min-h-screen bg-background-light page-shell-offset",
    children: [
      e.jsx(P, {
        eyebrow: "Nuestro litoral",
        title: a.nombre || "Playas de Cabrera de Mar",
        description:
          a.descripcion ||
          "Descubre un frente marítimo pensado para el descanso, la familia y el disfrute responsable. Arena dorada, aguas tranquilas y todos los servicios a tu alcance.",
        tone: "immersive",
        breadcrumbs: [
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/categorias" },
          { label: a.nombre },
        ],
        metrics: [
          { label: "Zonas de baño", value: o },
          {
            label: "Accesibilidad",
            value: y > 0 ? "Garantizada" : "En proceso",
          },
          { label: "Servicios", value: I > 0 ? "Completos" : "Básicos" },
        ],
        actions: e.jsxs(e.Fragment, {
          children: [
            e.jsxs(x, {
              to: "/categorias/beaches",
              className:
                "inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100",
              children: [
                e.jsx($, { className: "h-4 w-4 text-primary" }),
                "Abrir mapa completo",
              ],
            }),
            e.jsxs(x, {
              to: "/como-llegar",
              className:
                "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15",
              children: [e.jsx(M, { className: "h-4 w-4" }), "Cómo llegar"],
            }),
          ],
        }),
        media: d
          ? e.jsx("div", {
              className: "aspect-[4/3] overflow-hidden",
              children: e.jsx("img", {
                src: d,
                alt: a.nombre,
                className: "h-full w-full object-cover",
              }),
            })
          : void 0,
        aside: e.jsxs("div", {
          className: "space-y-4",
          children: [
            e.jsx("p", {
              className:
                "text-sm font-semibold uppercase tracking-[0.18em] text-slate-500",
              children: "Mediterráneo en estado puro",
            }),
            e.jsx("p", {
              className: "text-sm leading-6 text-slate-700",
              children:
                "Organiza tu día de playa con toda la información sobre accesos, servicios y características del entorno. Una experiencia costera accesible y cuidada.",
            }),
          ],
        }),
      }),
      e.jsxs("div", {
        className: "page-container space-y-10 py-10",
        children: [
          e.jsx(m, {
            children: e.jsx(O, {
              items: [
                {
                  title: `${o || 0} zonas de baño`,
                  description:
                    "Diferentes ambientes para familias, relax o paseo.",
                  icon: E,
                },
                {
                  title: `${y || 0} puntos accesibles`,
                  description:
                    "Pasarelas y facilidades para movilidad reducida.",
                  icon: D,
                },
                {
                  title: "Mar Mediterráneo",
                  description:
                    "Aguas transparentes y arena dorada característica.",
                  icon: L,
                },
                {
                  title: "Orientación y transporte",
                  description:
                    "Aparcamiento, transporte público y vías de acceso.",
                  icon: q,
                  href: "/como-llegar",
                },
              ],
            }),
          }),
          e.jsxs("section", {
            className: "space-y-6",
            children: [
              e.jsx(m, {
                children: e.jsx(B, {
                  eyebrow: "Panorama costero",
                  title: "Encuentra tu rincón ideal junto al mar",
                  description:
                    "Nuestras playas ofrecen diferentes perfiles, desde entornos urbanos con todos los servicios hasta zonas más serenas para desconectar.",
                }),
              }),
              r || s
                ? e.jsx("div", {
                    className: "grid gap-8 md:grid-cols-2",
                    children: [1, 2].map((n) =>
                      e.jsx(
                        "div",
                        {
                          className:
                            "card-surface h-[420px] animate-pulse bg-slate-100",
                        },
                        n,
                      ),
                    ),
                  })
                : o
                  ? e.jsx(z, {
                      className: "grid gap-8 lg:grid-cols-2",
                      children: l.map((n) => e.jsx(G, { beach: n }, n.id)),
                    })
                  : e.jsxs(H, {
                      className: "p-10 text-center",
                      children: [
                        e.jsx(E, {
                          className: "mx-auto mb-4 h-12 w-12 text-cyan-300",
                        }),
                        e.jsx("p", {
                          className: "text-lg font-semibold text-slate-900",
                          children:
                            "Aún no hay playas publicadas para esta categoría.",
                        }),
                        e.jsx("p", {
                          className: "mt-2 text-sm text-slate-500",
                          children:
                            "La plantilla ya está preparada y mostrará comparativa en cuanto existan exactamente dos.",
                        }),
                      ],
                    }),
            ],
          }),
          p
            ? e.jsxs("section", {
                className: "space-y-6",
                children: [
                  e.jsx(m, {
                    children: e.jsx(B, {
                      eyebrow: "Comparativa",
                      title: "Compara nuestras playas",
                      description:
                        "Revisa rápidamente los servicios y características para encontrar la costa que mejor se adapte a tu plan.",
                    }),
                  }),
                  e.jsx(m, { children: e.jsx(U, { beaches: l }) }),
                ],
              })
            : null,
          e.jsx(m, {
            children: e.jsx(F, {
              eyebrow: "Disfruta del frente marítimo",
              title: "Prepara tu día de playa en Cabrera",
              description:
                "Te esperamos con los brazos abiertos. Consulta el tiempo, el estado del mar y ven a relajarte a nuestro litoral.",
              actions: e.jsxs(e.Fragment, {
                children: [
                  e.jsxs(x, {
                    to: "/categorias/beaches",
                    className:
                      "inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all hover:scale-105 hover:bg-slate-50",
                    children: [
                      "Ver playas en el mapa",
                      e.jsx(R, { className: "h-4 w-4" }),
                    ],
                  }),
                  e.jsx(x, {
                    to: "/como-llegar",
                    className:
                      "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20",
                    children: "Llegar al municipio",
                  }),
                ],
              }),
            }),
          }),
        ],
      }),
    ],
  });
}
function G({ beach: a }) {
  var l, d;
  const t =
      ((l = a.featured_media) == null ? void 0 : l.variant_large) ||
      ((d = a.featured_media) == null ? void 0 : d.file) ||
      "/placeholder-place.jpg",
    s = c(a.services, j).slice(0, 3),
    i = c(a.accessibility_features, v).slice(0, 2),
    r = a.recommended_for
      .map((o) => {
        var p;
        return (p = f[o]) == null ? void 0 : p.label;
      })
      .filter(Boolean)
      .slice(0, 3);
  return e.jsxs("article", {
    "data-animated-card": !0,
    className:
      "group overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50",
    children: [
      e.jsxs("div", {
        className: "relative aspect-[16/10] overflow-hidden",
        children: [
          e.jsx("img", {
            src: t,
            alt: a.title,
            className: "h-full w-full object-cover",
          }),
          e.jsx("div", {
            className:
              "absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent",
          }),
          e.jsxs("div", {
            className:
              "absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 shadow-sm",
            children: [e.jsx(L, { className: "h-3.5 w-3.5" }), u[a.beach_type]],
          }),
          e.jsxs("div", {
            className: "absolute inset-x-0 bottom-0 p-5 text-white",
            children: [
              e.jsx("h3", {
                className: "text-2xl font-bold",
                children: a.title,
              }),
              e.jsx("p", {
                className: "mt-1 text-sm text-white/80",
                children: a.location_text,
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "space-y-5 p-6",
        children: [
          e.jsx("p", {
            className: "text-sm leading-6 text-slate-600",
            children:
              a.environment_summary ||
              a.description.replace(/<[^>]+>/g, "").slice(0, 150),
          }),
          e.jsxs("div", {
            className: "grid gap-3 sm:grid-cols-3",
            children: [
              e.jsx(b, { label: "Tipo", value: u[a.beach_type] }),
              e.jsx(b, {
                label: "Longitud",
                value: a.length_m ? `${a.length_m} m` : "Sin dato",
              }),
              e.jsx(b, {
                label: "Acceso",
                value: a.access_notes ? "Descrito" : "Pendiente",
              }),
            ],
          }),
          e.jsx(g, { title: "Ideal para", chips: r }),
          e.jsx(g, { title: "Servicios", chips: s }),
          e.jsx(g, { title: "Accesibilidad", chips: i }),
          e.jsxs("div", {
            className: "flex flex-wrap gap-3 pt-2",
            children: [
              e.jsxs(x, {
                to: `/playas/${a.slug}`,
                className:
                  "inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800",
                children: ["Ver detalle", e.jsx(R, { className: "h-4 w-4" })],
              }),
              e.jsxs("a", {
                href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.title} ${a.location_text}`)}`,
                target: "_blank",
                rel: "noreferrer",
                className:
                  "inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50",
                children: [
                  e.jsx(M, { className: "h-4 w-4 text-primary" }),
                  "Cómo llegar",
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function U({ beaches: a }) {
  const [t, s] = a,
    i = [
      { label: "Tipo", values: [u[t.beach_type], u[s.beach_type]] },
      {
        label: "Longitud",
        values: [
          t.length_m ? `${t.length_m} m` : "Sin dato",
          s.length_m ? `${s.length_m} m` : "Sin dato",
        ],
      },
      {
        label: "Servicios",
        values: [
          c(t.services, j).join(", ") || "Sin datos",
          c(s.services, j).join(", ") || "Sin datos",
        ],
      },
      {
        label: "Accesibilidad",
        values: [
          c(t.accessibility_features, v).join(", ") || "Sin datos",
          c(s.accessibility_features, v).join(", ") || "Sin datos",
        ],
      },
      {
        label: "Recomendada para",
        values: [
          t.recommended_for
            .map((r) => {
              var l;
              return (l = f[r]) == null ? void 0 : l.label;
            })
            .join(", ") || "Sin datos",
          s.recommended_for
            .map((r) => {
              var l;
              return (l = f[r]) == null ? void 0 : l.label;
            })
            .join(", ") || "Sin datos",
        ],
      },
    ];
  return e.jsxs("div", {
    className:
      "overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(9,32,52,0.08)]",
    children: [
      e.jsxs("div", {
        className:
          "grid grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] border-b border-slate-200/70 bg-slate-50/70",
        children: [
          e.jsx("div", {
            className:
              "px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500",
            children: "Criterio",
          }),
          e.jsx("div", {
            className: "px-5 py-4 text-lg font-semibold text-slate-900",
            children: t.title,
          }),
          e.jsx("div", {
            className: "px-5 py-4 text-lg font-semibold text-slate-900",
            children: s.title,
          }),
        ],
      }),
      i.map((r) =>
        e.jsxs(
          "div",
          {
            className:
              "grid grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] border-b border-slate-100 last:border-b-0",
            children: [
              e.jsx("div", {
                className:
                  "bg-slate-50/50 px-5 py-4 text-sm font-semibold text-slate-500",
                children: r.label,
              }),
              e.jsx("div", {
                className: "px-5 py-4 text-sm leading-6 text-slate-700",
                children: r.values[0],
              }),
              e.jsx("div", {
                className: "px-5 py-4 text-sm leading-6 text-slate-700",
                children: r.values[1],
              }),
            ],
          },
          r.label,
        ),
      ),
    ],
  });
}
function b({ label: a, value: t }) {
  return e.jsxs("div", {
    className: "rounded-2xl bg-slate-50 px-4 py-3",
    children: [
      e.jsx("p", {
        className:
          "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500",
        children: a,
      }),
      e.jsx("p", {
        className: "mt-1 text-sm font-semibold text-slate-900",
        children: t,
      }),
    ],
  });
}
function g({ title: a, chips: t }) {
  return t.length
    ? e.jsxs("div", {
        className: "space-y-2",
        children: [
          e.jsx("p", {
            className:
              "text-xs font-bold uppercase tracking-[0.18em] text-slate-500",
            children: a,
          }),
          e.jsx("div", {
            className: "flex flex-wrap gap-2",
            children: t.map((s) =>
              e.jsx(
                "span",
                {
                  className:
                    "inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700",
                  children: s,
                },
                s,
              ),
            ),
          }),
        ],
      })
    : null;
}
function c(a, t) {
  return Object.entries(a || {})
    .filter(([, s]) => !!s)
    .map(([s]) => {
      var i;
      return (i = t[s]) == null ? void 0 : i.label;
    })
    .filter((s) => !!s);
}
export { Y as default };
