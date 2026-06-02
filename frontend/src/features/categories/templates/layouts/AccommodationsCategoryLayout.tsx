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
import { useTranslation } from "@/hooks/useTranslation";

type StarFilter = "all" | 1 | 2 | 3 | 4 | 5;

function AccommodationsCategoryLayout({
  category,
  places,
}: CategoryLayoutProps) {
  const { t } = useTranslation();
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
    <div
      className="min-h-screen bg-background-light page-shell-offset"
      data-testid="category-layout-accommodations"
    >
      <PageHero
        eyebrow={t("Alojamiento")}
        title={category.nombre}
        description={category.descripcion}
        tone="immersive"
        breadcrumbs={[
          { label: t("Inicio"), href: "/" },
          { label: t("Categorías"), href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: t("Alojamientos"), value: accommodations.length },
          {
            label: t("Filtro"),
            value:
              starFilter === "all"
                ? t("Todos")
                : `${starFilter} ${t("estrellas")}`,
          },
          { label: t("Destino"), value: t("Cabrera de Mar") },
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
        <MotionReveal>
          <FilterBar>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Filter className="h-4 w-4 text-primary" />
                {t("Filtra por categoria de estrellas")}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-accommodations-filter-all"
                  onClick={() => setStarFilter("all")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                    starFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  {t("Todos")} ({places.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) =>
                  starCounts[stars] ? (
                    <button
                      key={stars}
                      id={`btn-accommodations-filter-${stars}-stars`}
                      onClick={() => setStarFilter(stars as StarFilter)}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                        starFilter === stars
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      }`}
                    >
                      {stars} {t("estrellas")}
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        <section className="space-y-6 defer-render">
          <MotionReveal>
            <SectionHeader
              eyebrow={t("Dormir en Cabrera")}
              title={`${filteredPlaces.length} ${t("alojamientos disponibles")}`}
              description={t(
                "Encuentra hoteles, apartamentos y alojamientos recomendados en el municipio.",
              )}
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
                title={t("Horarios tipicos")}
                text={t(
                  "Check-in desde las 14:00 y salida hasta las 11:00, segun cada establecimiento.",
                )}
              />
              <InfoTile
                icon={MapPin}
                title={t("Ubicacion")}
                text={t(
                  "Opciones bien conectadas para explorar el municipio y su entorno con comodidad.",
                )}
              />
              <InfoTile
                icon={Phone}
                title={t("Reservas")}
                text={t(
                  "Consulta cada ficha para contactar directamente o acceder al sistema de reserva.",
                )}
              />
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </div>
  );
}
AccommodationsCategoryLayout.displayName = "AccommodationsCategoryLayout";

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
InfoTile.displayName = "InfoTile";

export default AccommodationsCategoryLayout;
