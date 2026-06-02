import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import {
  DataCard,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { EventCard } from "@/features/agenda/components/EventCard";
import { CategoryLayoutProps } from "../types";
import { Place } from "@/features/places/types";
import { Event } from "@/features/events/types";
import { useTranslation } from "@/hooks/useTranslation";

function DefaultCategoryLayout({
  category,
  places,
  events,
  isLoadingPlaces,
  isLoadingEvents,
}: CategoryLayoutProps) {
  const { t } = useTranslation();
  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;

  return (
    <div
      className="min-h-screen bg-background-light page-shell-offset transition-colors duration-400"
      data-testid="category-layout-default"
    >
      <PageHero
        eyebrow={t("Categoria publica")}
        title={category.nombre}
        description={category.descripcion}
        tone="immersive"
        breadcrumbs={[
          { label: t("Inicio"), href: "/" },
          { label: t("Categorías"), href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: t("Lugares"), value: places.length },
          { label: t("Eventos"), value: events.length },
          { label: t("Ubicación"), value: t("Cabrera de Mar") },
        ]}
        media={
          image ? (
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={image}
                alt={category.nombre}
                className="h-full w-full object-cover"
                fetchPriority="high"
                loading="eager"
              />
            </div>
          ) : undefined
        }
      />

      <div className="page-container space-y-10 py-10">
        {places.length > 0 ? (
          <section className="space-y-6 defer-render">
            <MotionReveal>
              <SectionHeader
                eyebrow="Lugares"
                title={`Espacios relacionados con ${category.nombre}`}
                description="Una seleccion de puntos de interes vinculados a esta categoria."
              />
            </MotionReveal>
            <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {places.map((place: Place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </AnimatedCardGrid>
          </section>
        ) : null}

        {events.length > 0 ? (
          <section className="space-y-6 defer-render">
            <MotionReveal>
              <SectionHeader
                eyebrow="Agenda"
                title={`Eventos vinculados a ${category.nombre}`}
                description="Actividades y propuestas publicas asociadas a esta categoria."
              />
            </MotionReveal>
            <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </AnimatedCardGrid>
          </section>
        ) : null}

        {places.length === 0 &&
        events.length === 0 &&
        !isLoadingPlaces &&
        !isLoadingEvents ? (
          <div className="card-surface flex flex-col items-center justify-center gap-4 py-20 text-center border border-border-soft transition-colors duration-400">
            <p className="text-xl font-semibold text-text-secondary">
              {t("No hay contenido disponible en esta categoria todavia.")}
            </p>
            <Link
              to="/categorias"
              id="btn-default-layout-back"
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
            >
              {t("Volver a categorias")}
            </Link>
          </div>
        ) : null}

        {places.length > 0 || events.length > 0 ? (
          <MotionReveal>
            <div className="grid gap-4 md:grid-cols-2">
              <DataCard
                label="Lugares relacionados"
                value={places.length}
                icon={MapPin}
              />
              <DataCard
                label="Eventos relacionados"
                value={events.length}
                icon={Calendar}
              />
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </div>
  );
}
DefaultCategoryLayout.displayName = "DefaultCategoryLayout";
export default DefaultCategoryLayout;
