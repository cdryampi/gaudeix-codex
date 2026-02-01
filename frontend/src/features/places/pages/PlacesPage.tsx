import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPlaces } from "../api";
import { Place } from "../types";
import { PlaceCard } from "../components/PlaceCard";
import { InteractiveMap } from "@/components/site/InteractiveMap";
import { PLACE_CATEGORIES, getCategoryData } from "../constants";
import {
  Search,
  Map as MapIcon,
  List as ListIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";

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
    <div className="flex h-screen w-full flex-col bg-white pt-[144px] overflow-hidden">
      {/* Top Header / Filters */}
      <div className="z-20 flex shrink-0 flex-col border-b border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">
              Explora <span className="text-primary italic">Cabrera</span>
            </h1>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar lugares..."
                defaultValue={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    setSearchParams((prev) => {
                      if (val) prev.set("q", val);
                      else prev.delete("q");
                      return prev;
                    });
                  }
                }}
                className="h-11 w-64 rounded-2xl bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30 lg:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggles */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}
                title="Ver lista"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`hidden md:block p-2 rounded-lg transition-all ${viewMode === "split" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}
                title="Vista dividida"
              >
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-4 bg-current rounded-full opacity-50" />
                  <div className="w-3 h-4 bg-current rounded-full" />
                </div>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-all ${viewMode === "map" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}
                title="Ver mapa"
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 px-8 pb-4 overflow-x-auto no-scrollbar">
          {Object.entries(PLACE_CATEGORIES).map(([slug, data]) => {
            const isActive = activeCategory === slug;
            const Icon = data.icon;
            return (
              <button
                key={slug}
                onClick={() => handleCategoryToggle(slug)}
                className={`flex items-center gap-2 shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  isActive
                    ? `${data.bg} ${data.text} ${data.border.replace("100", "300")} shadow-sm scale-105`
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? "" : "opacity-40"}`}
                />
                {data.label}
                {isActive && <X className="h-3 w-3 ml-1 opacity-60" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden bg-slate-50/30">
        {/* Sidebar List */}
        <div
          className={`h-full overflow-y-auto transition-all duration-500 ${
            viewMode === "map"
              ? "w-0 opacity-0"
              : viewMode === "list"
                ? "w-full"
                : "w-full md:w-[450px] lg:w-[550px] xl:w-[650px]"
          } border-r border-slate-100 bg-white/50 custom-scrollbar relative z-10`}
        >
          <div className="p-8">
            <div className="mb-10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Resultados
                </p>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isLoading
                    ? "Buscando..."
                    : `${places.length} lugares encontrados`}
                </h2>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-96 w-full animate-pulse rounded-[2.5rem] bg-slate-100/50"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
                {places.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isHovered={hoveredPlaceId === place.id}
                    onMouseEnter={() => setHoveredPlaceId(place.id)}
                    onMouseLeave={() => setHoveredPlaceId(null)}
                  />
                ))}
              </div>
            )}

            {!isLoading && places.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-200 border-2 border-dashed border-slate-100">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  Sin resultados
                </h3>
                <p className="mt-2 text-slate-500 font-medium">
                  No hemos encontrado nada con esos filtros.
                  <br />
                  Prueba a limpiar la búsqueda.
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="mt-8 px-8 py-3 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div
          className={`relative h-full flex-1 transition-all duration-500 ${
            viewMode === "list" ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
        >
          <InteractiveMap
            highlightedPlaceId={hoveredPlaceId}
            onMarkerClick={(placeId) => {
              setHoveredPlaceId(placeId);
              // In list mode or small screens, we might want to switch view
              if (window.innerWidth < 768) setViewMode("list");
            }}
          />

          {/* Floating 'Search in this area' button mockup */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <button className="flex items-center gap-3 rounded-full bg-slate-950/90 backdrop-blur-xl px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl hover:scale-105 transition-transform border border-white/10">
              <MapIcon className="h-4 w-4 text-primary" />
              Actualizar zona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
