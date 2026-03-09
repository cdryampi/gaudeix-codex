import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { List as ListIcon, Map as MapIcon, Search, Sparkles, X } from "lucide-react";

import { FilterBar, PageHero, SectionHeader } from "@/components/site/primitives";
import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { getPlaces } from "../api";
import { PlaceCard } from "../components/PlaceCard";
import { InteractiveMap } from "@/components/site/InteractiveMap";
import { PLACE_CATEGORIES } from "../constants";

export const PlacesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoveredPlaceId, setHoveredPlaceId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");

  const activeCategory = searchParams.get("category");
  const searchQuery = searchParams.get("q") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["places", { category: activeCategory, q: searchQuery }],
    queryFn: () =>
      getPlaces({
        is_published: true,
        category: activeCategory || undefined,
        search: searchQuery || undefined,
      }),
  });

  const places = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results || [];
  }, [data]);

  const handleCategoryToggle = (slug: string) => {
    setSearchParams((prev) => {
      if (prev.get("category") === slug) prev.delete("category");
      else prev.set("category", slug);
      return prev;
    });
  };

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow="Territorio municipal"
        title="Explora lugares, patrimonio y recursos con una herramienta mas clara"
        description="El mapa y el listado evolucionan hacia una experiencia mas elegante y viva, manteniendo el foco en la informacion util para orientarte y descubrir el municipio."
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Lugares" },
        ]}
        metrics={[
          { label: "Resultados", value: `${places.length} lugares` },
          { label: "Vista", value: viewMode === "split" ? "Mapa + lista" : viewMode === "map" ? "Solo mapa" : "Solo lista" },
          { label: "Filtro", value: activeCategory || "Todas las categorias" },
        ]}
      />

      <div className="page-container space-y-8 py-10">
        <MotionReveal>
          <FilterBar>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar lugares..."
                    defaultValue={searchQuery}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.target as HTMLInputElement).value;
                        setSearchParams((prev) => {
                          if (value) prev.set("q", value);
                          else prev.delete("q");
                          return prev;
                        });
                      }
                    }}
                    className="h-12 w-full rounded-2xl border border-[color:var(--color-border-soft)] bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>

                <div className="flex rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="Vista lista"
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${viewMode === "list" ? "bg-slate-100/80 text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <ListIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("split")}
                    aria-label="Vista dividida"
                    className={`hidden rounded-xl px-4 py-2 text-sm font-semibold transition lg:block ${viewMode === "split" ? "bg-slate-100/80 text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    aria-label="Vista mapa"
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${viewMode === "map" ? "bg-slate-100/80 text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <MapIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {Object.entries(PLACE_CATEGORIES).map(([slug, categoryData]) => {
                  const isActive = activeCategory === slug;
                  const Icon = categoryData.icon;
                  return (
                    <button
                      key={slug}
                      onClick={() => handleCategoryToggle(slug)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isActive
                          ? "border-primary/20 bg-primary/8 text-primary"
                          : "border-[color:var(--color-border-soft)] bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {categoryData.label}
                      {isActive ? <X className="h-3 w-3 opacity-70" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        <MotionReveal>
          <SectionHeader
            eyebrow="Explorador publico"
            title={isLoading ? "Buscando lugares..." : `${places.length} lugares encontrados`}
            description="Selecciona una vista y navega por recursos culturales, naturales y de servicio del municipio."
            action={
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-4 py-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Navegacion renovada
              </div>
            }
          />
        </MotionReveal>

        <div className="relative flex flex-1 gap-6">
          <div
            data-testid="places-list-panel"
            className={`space-y-6 ${viewMode === "map"
                ? "hidden"
                : viewMode === "list"
                  ? "w-full"
                  : "w-full lg:w-[48%] xl:w-[44%]"
              }`}
          >
            {isLoading ? (
              <div className="grid gap-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="card-surface h-[320px] animate-pulse bg-slate-100" />
                ))}
              </div>
            ) : places.length ? (
              <AnimatedCardGrid className="grid gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 xl:gap-10">
                {places.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isHovered={hoveredPlaceId === place.id}
                    onMouseEnter={() => setHoveredPlaceId(place.id)}
                    onMouseLeave={() => setHoveredPlaceId(null)}
                  />
                ))}
              </AnimatedCardGrid>
            ) : (
              <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
                <span className="text-xl font-semibold text-slate-500">
                  No hemos encontrado lugares con esos filtros.
                </span>
              </div>
            )}
          </div>

          <div
            data-testid="places-map-panel"
            className={`card-surface overflow-hidden ${viewMode === "list"
                ? "hidden"
                : viewMode === "map"
                  ? "w-full"
                  : "min-h-[720px] flex-1"
              }`}
          >
            <div className="h-[720px]">
              <InteractiveMap
                highlightedPlaceId={hoveredPlaceId}
                onMarkerClick={(placeId) => {
                  setHoveredPlaceId(placeId);
                  if (window.innerWidth < 768) setViewMode("list");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
