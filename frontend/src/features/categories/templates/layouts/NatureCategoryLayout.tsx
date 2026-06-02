import { useState } from "react";
import { Camera, Grid3X3, Map, TreePine } from "lucide-react";
import { Link } from "react-router-dom";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import {
  FilterBar,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { CategoryLayoutProps } from "../types";

type ViewMode = "grid" | "gallery";

function NatureCategoryLayout({
  category,
  places,
  isLoadingPlaces,
}: CategoryLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;

  const galleryImages = places
    .filter((p) => p.featured_media?.variant_large || p.featured_media?.file)
    .map((p) => ({
      url: p.featured_media?.variant_large || p.featured_media?.file || "",
      title: p.title,
    }));

  return (
    <div
      className="min-h-screen bg-background-light page-shell-offset"
      data-testid="category-layout-nature"
    >
      <PageHero
        eyebrow="Naturaleza y territorio"
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
          {
            label: "Vista activa",
            value: viewMode === "grid" ? "Recorrido" : "Galeria",
          },
          { label: "Plan", value: "Explora y abre mapa" },
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Recorre el entorno a tu ritmo
                </p>
                <p className="text-sm text-text-secondary">
                  Alterna entre una lectura tipo guia y una galeria visual para
                  inspirarte antes de la visita.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-surface-muted border border-border-soft p-1">
                  <button
                    id="btn-nature-view-grid"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      Recorrido
                    </span>
                  </button>
                  <button
                    id="btn-nature-view-gallery"
                    onClick={() => setViewMode("gallery")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      viewMode === "gallery"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Galeria
                    </span>
                  </button>
                </div>

                <Link
                  to={`/categorias/${category.slug}`}
                  id="btn-nature-map-view"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                >
                  <Map className="h-4 w-4" />
                  Ver mapa
                </Link>
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        <section className="space-y-6">
          <MotionReveal>
            <SectionHeader
              eyebrow="Explora"
              title={
                viewMode === "grid"
                  ? `${places.length} lugares para descubrir`
                  : "Galeria inspiracional"
              }
              description="Una plantilla mas luminosa y ordenada para patrimonio, naturaleza y recorridos de descubrimiento."
            />
          </MotionReveal>

          {viewMode === "grid" ? (
            <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </AnimatedCardGrid>
          ) : (
            <AnimatedCardGrid className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:gap-8">
              {galleryImages.map((img) => (
                <button
                  key={img.url}
                  id={`btn-nature-gallery-img-${img.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  data-animated-card
                  onClick={() => setSelectedImage(img.url)}
                  className="group relative aspect-square overflow-hidden rounded-[1.75rem] border border-border-soft bg-surface transition-all duration-300"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,24,37,0.65))]" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                    <p className="text-sm font-semibold text-white">
                      {img.title}
                    </p>
                  </div>
                </button>
              ))}
            </AnimatedCardGrid>
          )}
        </section>

        {category.slug === "beaches" ? (
          <MotionReveal>
            {places.length === 2 ? (
              <section className="card-surface space-y-6 p-6 md:p-8 border border-border-soft">
                <SectionHeader
                  eyebrow="Comparativa"
                  title="Compara las dos playas publicadas"
                  description="Vista rapida para decidir cual visitar segun ubicacion y contacto disponible."
                />
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-text-secondary">
                    <thead>
                      <tr className="border-b border-border-soft text-xs uppercase tracking-[0.14em] text-text-secondary/70">
                        <th className="px-3 py-3">Playa</th>
                        <th className="px-3 py-3">Ubicacion</th>
                        <th className="px-3 py-3">Telefono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {places.map((place) => (
                        <tr
                          key={place.id}
                          className="border-b border-border-soft/60 last:border-b-0"
                        >
                          <td className="px-3 py-3 font-semibold text-text-primary">
                            {place.title}
                          </td>
                          <td className="px-3 py-3">{place.location_text}</td>
                          <td className="px-3 py-3">{place.phone || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              <section className="card-surface space-y-4 p-6 md:p-8 border border-border-soft">
                <SectionHeader
                  eyebrow="Seleccion editorial"
                  title="El equipo municipal destaca las mejores opciones para hoy"
                  description="Cuando hay mas o menos de dos playas publicadas, mostramos una narrativa editorial en lugar de forzar una comparativa."
                />
              </section>
            )}
          </MotionReveal>
        ) : null}

        {places.length === 0 && !isLoadingPlaces ? (
          <div className="py-24 text-center">
            <TreePine className="mx-auto mb-6 h-16 w-16 text-text-secondary/40" />
            <p className="text-xl font-bold text-text-secondary">
              No hay lugares en esta categoria todavia.
            </p>
          </div>
        ) : null}
      </div>

      {selectedImage ? (
        <div
          id="nature-lightbox-overlay"
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-background-dark/95 p-8"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt=""
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
NatureCategoryLayout.displayName = "NatureCategoryLayout";
export default NatureCategoryLayout;
