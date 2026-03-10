import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Accessibility,
  CarFront,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Route,
  ShieldCheck,
  type LucideIcon,
  Waves,
} from "lucide-react";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { NearbyPlaces } from "@/features/places/components/NearbyPlaces";
import {
  ContentCard,
  InfoBand,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { getBeachBySlug } from "../api";
import {
  BEACH_ACCESSIBILITY_META,
  BEACH_SERVICE_META,
  BEACH_TYPE_LABELS,
  RECOMMENDED_FOR_META,
} from "../content";
import { Beach } from "../types";

export function BeachDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: beach,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["beach", slug],
    queryFn: () => getBeachBySlug(slug!),
    enabled: !!slug,
  });

  const galleryImages = useMemo(() => {
    if (!beach) return [];

    const images = [beach.featured_media, ...(beach.gallery || [])].filter(
      (image): image is NonNullable<Beach["featured_media"]> => Boolean(image),
    );
    const unique = new Map<string, NonNullable<Beach["featured_media"]>>();

    images.forEach((image) => {
      if (!image) return;
      unique.set(String(image.id), image);
    });

    return Array.from(unique.values());
  }, [beach]);

  if (isLoading) {
    return <BeachDetailSkeleton />;
  }

  if (error || !beach) {
    return (
      <div className="page-shell-offset py-24 text-center text-lg text-slate-500">
        Playa no encontrada
      </div>
    );
  }

  const imageUrl =
    beach.featured_media?.variant_large ||
    beach.featured_media?.file ||
    galleryImages[0]?.variant_large ||
    galleryImages[0]?.file ||
    "/placeholder-place.jpg";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${beach.title} ${beach.location_text}`,
  )}`;
  const activeServices = getActiveItems(beach.services, BEACH_SERVICE_META);
  const activeAccessibility = getActiveItems(
    beach.accessibility_features,
    BEACH_ACCESSIBILITY_META,
  );
  const recommendations = beach.recommended_for
    .map((key) => RECOMMENDED_FOR_META[key])
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow="Ficha de playa"
        title={beach.title}
        description={beach.environment_summary || beach.location_text}
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/categorias" },
          { label: "Playas", href: "/categorias/beaches" },
          { label: beach.title },
        ]}
        metrics={[
          { label: "Tipo", value: BEACH_TYPE_LABELS[beach.beach_type] },
          {
            label: "Longitud",
            value: beach.length_m ? `${beach.length_m} m aprox.` : "Sin dato",
          },
          {
            label: "Servicios",
            value: `${activeServices.length + activeAccessibility.length} señales útiles`,
          },
        ]}
        actions={
          <>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              <Route className="h-4 w-4 text-primary" />
              Cómo llegar
            </a>
            <a
              href="/categorias/beaches"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <MapPin className="h-4 w-4" />
              Ver mapa general
            </a>
          </>
        }
        media={
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={beach.title}
              className="h-full w-full object-cover"
            />
          </div>
        }
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <InfoBand
            items={[
              {
                title: "Ubicación",
                description:
                  beach.location_text ||
                  "Situada en la costa de Cabrera de Mar.",
                icon: MapPin,
              },
              {
                title: "Aparcamiento",
                description:
                  beach.parking_info ||
                  "Consultar zonas de estacionamiento habilitadas cercanas.",
                icon: CarFront,
              },
              {
                title: "Transporte público",
                description:
                  beach.public_transport_info ||
                  "Accesible en tren (estación cercana) y bus interurbano.",
                icon: Route,
              },
              {
                title: "Accesibilidad",
                description: activeAccessibility.length
                  ? `${activeAccessibility.length} servicios adaptados disponibles.`
                  : "Consultar opciones de acceso para personas con movilidad reducida.",
                icon: Accessibility,
              },
            ]}
          />
        </MotionReveal>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <MotionReveal>
              <ContentCard className="p-8 md:p-10 border border-slate-200/60 shadow-sm">
                <SectionHeader
                  eyebrow="Resumen del entorno"
                  title="Descubre tu lugar en la costa"
                  description="Información detallada sobre esta playa para planificar tu visita perfecta."
                />
                <div
                  className="prose prose-slate prose-lg mt-8 max-w-none prose-a:text-primary hover:prose-a:text-secondary"
                  dangerouslySetInnerHTML={{ __html: beach.description }}
                />
              </ContentCard>
            </MotionReveal>

            {galleryImages.length ? (
              <MotionReveal>
                <ContentCard className="p-8 md:p-10 border border-slate-200/60 shadow-sm">
                  <SectionHeader
                    eyebrow="Galería"
                    title="Imágenes del entorno"
                    description="Explora visualmente los rincones y detalles de esta ubicación."
                  />
                  <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3">
                    {galleryImages.map((image, index) => (
                      <div
                        key={`${image.id}-${index}`}
                        className="overflow-hidden rounded-[1.5rem] bg-slate-100 ring-1 ring-slate-900/5 transition-transform hover:scale-[1.02]"
                      >
                        <img
                          src={image.variant_large || image.file}
                          alt={image.title || beach.title}
                          className="aspect-[4/3] h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </MotionReveal>
            ) : null}

            <section className="grid gap-6 md:grid-cols-2">
              <MotionReveal>
                <FeaturePanel
                  eyebrow="Servicios"
                  title="Equipamiento"
                  items={activeServices}
                  emptyMessage="No hay servicios específicos registrados actualmente."
                />
              </MotionReveal>
              <MotionReveal>
                <FeaturePanel
                  eyebrow="Accesibilidad"
                  title="Apoyos disponibles"
                  items={activeAccessibility}
                  emptyMessage="No hay características de accesibilidad registradas."
                />
              </MotionReveal>
            </section>
          </div>

          <MotionReveal>
            <aside className="space-y-6">
              <ContentCard className="p-8 border border-slate-200/60 shadow-sm bg-gradient-to-b from-white to-slate-50/50">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Acceso y contacto
                </h2>
                <div className="mt-6 space-y-5 text-base text-slate-700">
                  <p className="flex items-start gap-4">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>
                      {beach.location_text || "Ubicación por definir"}
                    </span>
                  </p>
                  {beach.phone ? (
                    <a
                      href={`tel:${beach.phone}`}
                      className="flex items-center gap-4 hover:text-primary transition-colors"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <span>{beach.phone}</span>
                    </a>
                  ) : null}
                  {beach.email ? (
                    <a
                      href={`mailto:${beach.email}`}
                      className="flex items-center gap-4 hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="truncate">{beach.email}</span>
                    </a>
                  ) : null}
                  {beach.website ? (
                    <a
                      href={beach.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-4 hover:text-primary transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                      <span>Web oficial</span>
                    </a>
                  ) : null}
                </div>

                <div className="mt-8 space-y-3">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-secondary hover:shadow-md hover:-translate-y-0.5"
                  >
                    Cómo llegar con Maps
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </a>
                  {beach.booking_url ? (
                    <a
                      href={beach.booking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-xl border-2 border-primary/10 bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10 hover:border-primary/20"
                    >
                      MÁS INFORMACIÓN
                    </a>
                  ) : null}
                </div>
              </ContentCard>

              {recommendations.length > 0 && (
                <ContentCard className="p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Waves className="w-24 h-24" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 mb-5 relative z-10">
                    Especialmente recomendada para
                  </p>
                  <div className="flex flex-col gap-3 relative z-10">
                    {recommendations.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-2xl bg-cyan-50/80 border border-cyan-100 px-4 py-3 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                          <item.icon className="h-4 w-4 text-cyan-600" />
                        </div>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </ContentCard>
              )}
            </aside>
          </MotionReveal>
        </div>

        {beach.latitude && beach.longitude ? (
          <MotionReveal>
            <ContentCard className="p-6">
              <SectionHeader
                eyebrow="Mapa y entorno"
                title="Cómo llegar y qué hay cerca"
                description="Se mantiene el contexto territorial del municipio y se aprovecha la geolocalización heredada de Place."
              />
              <div className="mt-8">
                <NearbyPlaces
                  latitude={beach.latitude}
                  longitude={beach.longitude}
                  currentPlaceId={beach.id}
                />
              </div>
            </ContentCard>
          </MotionReveal>
        ) : null}
      </div>
    </main>
  );
}

function FeaturePanel({
  eyebrow,
  title,
  items,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  items: Array<{ label: string; icon: LucideIcon }>;
  emptyMessage: string;
}) {
  return (
    <ContentCard className="h-full p-8">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="mt-8 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {item.label}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-slate-500">{emptyMessage}</p>
        )}
      </div>
    </ContentCard>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
        {value}
      </span>
    </div>
  );
}

function getActiveItems<T extends string>(
  values: Partial<Record<T, boolean>>,
  meta: Record<T, { label: string; icon: LucideIcon }>,
) {
  return Object.entries(values || {})
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => meta[key as T])
    .filter((item): item is { label: string; icon: LucideIcon } =>
      Boolean(item),
    );
}

function BeachDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background-light page-shell-offset">
      <div className="page-container space-y-8 py-10">
        <div className="card-surface h-[320px] animate-pulse bg-slate-100" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="card-surface h-[420px] animate-pulse bg-slate-100" />
          <div className="card-surface h-[320px] animate-pulse bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
