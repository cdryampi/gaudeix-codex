import { useState } from "react";
import { Clock, Filter, MapPin, Phone } from "lucide-react";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import {
  FilterBar,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { CategoryLayoutProps } from "../types";
import { Accommodation } from "@/features/places/types";

type StarFilter = "all" | 1 | 2 | 3 | 4 | 5;

export default function AccommodationsCategoryLayout({
  category,
  places,
}: CategoryLayoutProps) {
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;

  const accommodations = places as Accommodation[];
  const filteredPlaces =
    starFilter === "all"
      ? accommodations
      : accommodations.filter((p) => p.stars === starFilter);

  const starCounts = accommodations.reduce(
    (acc, p) => {
      if (p.stars) acc[p.stars] = (acc[p.stars] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  return (
    <main
      className="min-h-screen bg-background-light page-shell-offset"
      data-testid="category-layout-accommodations"
    >
      <PageHero
        eyebrow="Alojamiento"
        title={category.nombre}
        description={category.descripcion}
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: "Alojamientos", value: accommodations.length },
          {
            label: "Filtro",
            value: starFilter === "all" ? "Todos" : `${starFilter} estrellas`,
          },
          { label: "Plan", value: "Dormir y desplazarte mejor" },
        ]}
        media={
          image ? (
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={image}
                alt={category.nombre}
                className="h-full w-full object-cover"
              />
            </div>
          ) : undefined
        }
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <FilterBar>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Filter className="h-4 w-4 text-primary" />
                Filtra por categoria de estrellas
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStarFilter("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                    starFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  Todos ({places.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) =>
                  starCounts[stars] ? (
                    <button
                      key={stars}
                      onClick={() => setStarFilter(stars as StarFilter)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                        starFilter === stars
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      }`}
                    >
                      {stars} estrellas
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        <section className="space-y-6">
          <MotionReveal>
            <SectionHeader
              eyebrow="Dormir en Cabrera"
              title={`${filteredPlaces.length} alojamientos disponibles`}
              description="Un listado mas actual para hoteles, apartamentos y otros espacios donde alojarte."
            />
          </MotionReveal>

          <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </AnimatedCardGrid>
        </section>

        {places.length > 0 ? (
          <MotionReveal>
            <div className="grid gap-6 md:grid-cols-3">
              <InfoTile
                icon={Clock}
                title="Horarios tipicos"
                text="Check-in desde las 14:00 y salida hasta las 11:00, segun cada establecimiento."
              />
              <InfoTile
                icon={MapPin}
                title="Ubicacion"
                text="Opciones bien conectadas para explorar el municipio y su entorno con comodidad."
              />
              <InfoTile
                icon={Phone}
                title="Reservas"
                text="Consulta cada ficha para contactar directamente o acceder al sistema de reserva."
              />
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </main>
  );
}

function InfoTile({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Clock;
  title: string;
  text: string;
}) {
  return (
    <div className="card-surface p-7 border border-border-soft">
      <Icon className="h-7 w-7 text-primary" />
      <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{text}</p>
    </div>
  );
}
