import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Accessibility,
  ArrowRight,
  Map,
  Navigation,
  Palmtree,
  Route,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import {
  ContentCard,
  InfoBand,
  MunicipalCTA,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { getBeaches } from "@/features/beaches/api";
import {
  BEACH_ACCESSIBILITY_META,
  BEACH_SERVICE_META,
  BEACH_TYPE_LABELS,
  RECOMMENDED_FOR_META,
} from "@/features/beaches/content";
import { Beach } from "@/features/beaches/types";
import { CategoryLayoutProps } from "../types";

export default function BeachesCategoryLayout({
  category,
  places,
  isLoadingPlaces,
}: CategoryLayoutProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["beaches", "category-layout"],
    queryFn: () => getBeaches({ is_published: true }),
  });

  const beaches = useMemo<Beach[]>(() => {
    if (data) {
      return Array.isArray(data) ? data : data.results;
    }

    return (places as Beach[]) || [];
  }, [data, places]);

  const heroImage =
    category.featured_media?.variant_large ||
    category.featured_media?.file ||
    beaches[0]?.featured_media?.variant_large ||
    beaches[0]?.featured_media?.file;

  const activeCount = beaches.length;
  const comparisonEnabled = activeCount === 2;
  const totalServices = beaches.reduce(
    (count, beach) =>
      count + Object.values(beach.services || {}).filter(Boolean).length,
    0,
  );
  const totalAccessibility = beaches.reduce(
    (count, beach) =>
      count +
      Object.values(beach.accessibility_features || {}).filter(Boolean).length,
    0,
  );

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow="Nuestro litoral"
        title={category.nombre || "Playas de Cabrera de Mar"}
        description={
          category.descripcion ||
          "Descubre un frente marítimo pensado para el descanso, la familia y el disfrute responsable. Arena dorada, aguas tranquilas y todos los servicios a tu alcance."
        }
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: "Zonas de baño", value: activeCount },
          {
            label: "Accesibilidad",
            value: totalAccessibility > 0 ? "Garantizada" : "En proceso",
          },
          {
            label: "Servicios",
            value: totalServices > 0 ? "Completos" : "Básicos",
          },
        ]}
        actions={
          <>
            <Link
              to="/categorias/beaches"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              <Map className="h-4 w-4 text-primary" />
              Abrir mapa completo
            </Link>
            <Link
              to="/como-llegar"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Navigation className="h-4 w-4" />
              Cómo llegar
            </Link>
          </>
        }
        media={
          heroImage ? (
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={heroImage}
                alt={category.nombre}
                className="h-full w-full object-cover"
              />
            </div>
          ) : undefined
        }
        aside={
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Mediterráneo en estado puro
            </p>
            <p className="text-sm leading-6 text-slate-700">
              Organiza tu día de playa con toda la información sobre accesos,
              servicios y características del entorno. Una experiencia costera
              accesible y cuidada.
            </p>
          </div>
        }
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <InfoBand
            items={[
              {
                title: `${activeCount || 0} zonas de baño`,
                description:
                  "Diferentes ambientes para familias, relax o paseo.",
                icon: Palmtree,
              },
              {
                title: `${totalAccessibility || 0} puntos accesibles`,
                description: "Pasarelas y facilidades para movilidad reducida.",
                icon: Accessibility,
              },
              {
                title: "Mar Mediterráneo",
                description:
                  "Aguas transparentes y arena dorada característica.",
                icon: Waves,
              },
              {
                title: "Orientación y transporte",
                description:
                  "Aparcamiento, transporte público y vías de acceso.",
                icon: Route,
                href: "/como-llegar",
              },
            ]}
          />
        </MotionReveal>

        <section className="space-y-6">
          <MotionReveal>
            <SectionHeader
              eyebrow="Panorama costero"
              title="Encuentra tu rincón ideal junto al mar"
              description="Nuestras playas ofrecen diferentes perfiles, desde entornos urbanos con todos los servicios hasta zonas más serenas para desconectar."
            />
          </MotionReveal>

          {isLoading || isLoadingPlaces ? (
            <div className="grid gap-8 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="card-surface h-[420px] animate-pulse bg-slate-100"
                />
              ))}
            </div>
          ) : activeCount ? (
            <AnimatedCardGrid className="grid gap-8 lg:grid-cols-2">
              {beaches.map((beach) => (
                <BeachShowcaseCard key={beach.id} beach={beach} />
              ))}
            </AnimatedCardGrid>
          ) : (
            <ContentCard className="p-10 text-center">
              <Palmtree className="mx-auto mb-4 h-12 w-12 text-cyan-300" />
              <p className="text-lg font-semibold text-slate-900">
                Aún no hay playas publicadas para esta categoría.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                La plantilla ya está preparada y mostrará comparativa en cuanto
                existan exactamente dos.
              </p>
            </ContentCard>
          )}
        </section>

        {comparisonEnabled ? (
          <section className="space-y-6">
            <MotionReveal>
              <SectionHeader
                eyebrow="Comparativa"
                title="Compara nuestras playas"
                description="Revisa rápidamente los servicios y características para encontrar la costa que mejor se adapte a tu plan."
              />
            </MotionReveal>

            <MotionReveal>
              <BeachComparisonTable beaches={beaches} />
            </MotionReveal>
          </section>
        ) : null}

        <MotionReveal>
          <MunicipalCTA
            eyebrow="Disfruta del frente marítimo"
            title="Prepara tu día de playa en Cabrera"
            description="Te esperamos con los brazos abiertos. Consulta el tiempo, el estado del mar y ven a relajarte a nuestro litoral."
            actions={
              <>
                <Link
                  to="/categorias/beaches"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all hover:scale-105 hover:bg-slate-50"
                >
                  Ver playas en el mapa
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/como-llegar"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  Llegar al municipio
                </Link>
              </>
            }
          />
        </MotionReveal>
      </div>
    </main>
  );
}

function BeachShowcaseCard({ beach }: { beach: Beach }) {
  const image =
    beach.featured_media?.variant_large ||
    beach.featured_media?.file ||
    "/placeholder-place.jpg";
  const serviceChips = getActiveLabels(
    beach.services,
    BEACH_SERVICE_META,
  ).slice(0, 3);
  const accessibilityChips = getActiveLabels(
    beach.accessibility_features,
    BEACH_ACCESSIBILITY_META,
  ).slice(0, 2);
  const recommendationChips = beach.recommended_for
    .map((key) => RECOMMENDED_FOR_META[key]?.label)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <article
      data-animated-card
      className="group overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={beach.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 shadow-sm">
          <Waves className="h-3.5 w-3.5" />
          {BEACH_TYPE_LABELS[beach.beach_type]}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="text-2xl font-bold">{beach.title}</h3>
          <p className="mt-1 text-sm text-white/80">{beach.location_text}</p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <p className="text-sm leading-6 text-slate-600">
          {beach.environment_summary ||
            beach.description.replace(/<[^>]+>/g, "").slice(0, 150)}
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <InlineMeta
            label="Tipo"
            value={BEACH_TYPE_LABELS[beach.beach_type]}
          />
          <InlineMeta
            label="Longitud"
            value={beach.length_m ? `${beach.length_m} m` : "Sin dato"}
          />
          <InlineMeta
            label="Acceso"
            value={beach.access_notes ? "Descrito" : "Pendiente"}
          />
        </div>

        <ChipRow title="Ideal para" chips={recommendationChips} />
        <ChipRow title="Servicios" chips={serviceChips} />
        <ChipRow title="Accesibilidad" chips={accessibilityChips} />

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={`/playas/${beach.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Ver detalle
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${beach.title} ${beach.location_text}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Navigation className="h-4 w-4 text-primary" />
            Cómo llegar
          </a>
        </div>
      </div>
    </article>
  );
}

function BeachComparisonTable({ beaches }: { beaches: Beach[] }) {
  const [left, right] = beaches;

  const rows = [
    {
      label: "Tipo",
      values: [
        BEACH_TYPE_LABELS[left.beach_type],
        BEACH_TYPE_LABELS[right.beach_type],
      ],
    },
    {
      label: "Longitud",
      values: [
        left.length_m ? `${left.length_m} m` : "Sin dato",
        right.length_m ? `${right.length_m} m` : "Sin dato",
      ],
    },
    {
      label: "Servicios",
      values: [
        getActiveLabels(left.services, BEACH_SERVICE_META).join(", ") ||
          "Sin datos",
        getActiveLabels(right.services, BEACH_SERVICE_META).join(", ") ||
          "Sin datos",
      ],
    },
    {
      label: "Accesibilidad",
      values: [
        getActiveLabels(
          left.accessibility_features,
          BEACH_ACCESSIBILITY_META,
        ).join(", ") || "Sin datos",
        getActiveLabels(
          right.accessibility_features,
          BEACH_ACCESSIBILITY_META,
        ).join(", ") || "Sin datos",
      ],
    },
    {
      label: "Recomendada para",
      values: [
        left.recommended_for
          .map((key) => RECOMMENDED_FOR_META[key]?.label)
          .join(", ") || "Sin datos",
        right.recommended_for
          .map((key) => RECOMMENDED_FOR_META[key]?.label)
          .join(", ") || "Sin datos",
      ],
    },
  ];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(9,32,52,0.08)]">
      <div className="grid grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] border-b border-slate-200/70 bg-slate-50/70">
        <div className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Criterio
        </div>
        <div className="px-5 py-4 text-lg font-semibold text-slate-900">
          {left.title}
        </div>
        <div className="px-5 py-4 text-lg font-semibold text-slate-900">
          {right.title}
        </div>
      </div>

      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] border-b border-slate-100 last:border-b-0"
        >
          <div className="bg-slate-50/50 px-5 py-4 text-sm font-semibold text-slate-500">
            {row.label}
          </div>
          <div className="px-5 py-4 text-sm leading-6 text-slate-700">
            {row.values[0]}
          </div>
          <div className="px-5 py-4 text-sm leading-6 text-slate-700">
            {row.values[1]}
          </div>
        </div>
      ))}
    </div>
  );
}

function InlineMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ChipRow({ title, chips }: { title: string; chips: string[] }) {
  if (!chips.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function getActiveLabels<T extends string>(
  values: Partial<Record<T, boolean>>,
  meta: Record<T, { label: string }>,
) {
  return Object.entries(values || {})
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => meta[key as T]?.label)
    .filter((value): value is string => Boolean(value));
}
