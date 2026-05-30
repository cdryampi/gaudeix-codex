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

export default function DefaultCategoryLayout({
  category,
  places,
  events,
  isLoadingPlaces,
  isLoadingEvents,
}: CategoryLayoutProps) {
  return (
    <main
      className="min-h-screen bg-background-light page-shell-offset transition-colors duration-400"
      data-testid="category-layout-default"
    >
      <PageHero
        eyebrow="Categoria publica"
        title={category.nombre}
        description={category.descripcion}
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: "Lugares", value: places.length },
          { label: "Eventos", value: events.length },
          { label: "Tema", value: "Exploracion publica" },
        ]}
      />

      <div className="page-container space-y-14 py-10">
        {places.length > 0 ? (
          <section className="space-y-6">
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
          <section className="space-y-6">
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
              No hay contenido disponible en esta categoria todavia.
            </p>
            <Link
              to="/categorias"
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
            >
              Volver a categorias
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
    </main>
  );
}
