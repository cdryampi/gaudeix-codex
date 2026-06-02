import { useMemo, useState } from "react";
import { Clock, DollarSign, Filter, Phone } from "lucide-react";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import {
  FilterBar,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { CategoryLayoutProps } from "../types";
import { Restaurant } from "@/features/places/types";

type CuisineFilter = "all" | string;

function RestaurantsCategoryLayout({ category, places }: CategoryLayoutProps) {
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>("all");
  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;
  const restaurants = places as Restaurant[];

  const cuisineTypes = useMemo(() => {
    const types = new Set<string>();
    restaurants.forEach((r) => {
      if (r.cuisine_type) types.add(r.cuisine_type);
    });
    return Array.from(types).sort();
  }, [restaurants]);

  const filteredPlaces =
    cuisineFilter === "all"
      ? restaurants
      : restaurants.filter((r) => r.cuisine_type === cuisineFilter);

  return (
    <div
      className="min-h-screen bg-background-light page-shell-offset"
      data-testid="category-layout-restaurants"
    >
      <PageHero
        eyebrow="Gastronomia local"
        title={category.nombre}
        description={category.descripcion}
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: "Restaurantes", value: restaurants.length },
          {
            label: "Filtro",
            value: cuisineFilter === "all" ? "Todos" : cuisineFilter,
          },
          { label: "Experiencia", value: "Comer, reservar y descubrir" },
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
                Filtra por tipo de cocina
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-restaurants-filter-all"
                  onClick={() => setCuisineFilter("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                    cuisineFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  Todos ({restaurants.length})
                </button>
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    id={`btn-restaurants-filter-${cuisine.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    onClick={() => setCuisineFilter(cuisine)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold capitalize border border-border-soft transition-all duration-200 ${
                      cuisineFilter === cuisine
                        ? "bg-primary text-white"
                        : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        <section className="space-y-6">
          <MotionReveal>
            <SectionHeader
              eyebrow="Sabores del municipio"
              title={`${filteredPlaces.length} propuestas para comer en Cabrera de Mar`}
              description="Una plantilla mas ligera y alegre para gastronomia, manteniendo datos utiles y acceso directo a cada ficha."
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
                text="Comidas 13:00 - 16:00 y cenas 20:00 - 23:00 según establecimiento."
              />
              <InfoTile
                icon={Phone}
                title="Reservas"
                text="Conviene reservar con antelacion durante fines de semana y fechas señaladas."
              />
              <InfoTile
                icon={DollarSign}
                title="Precios orientativos"
                text="Consulta cada ficha para ver web, contacto y detalles del establecimiento."
              />
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </div>
  );
}
RestaurantsCategoryLayout.displayName = "RestaurantsCategoryLayout";

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

export default RestaurantsCategoryLayout;
