/**
 * AccommodationsCategoryLayout - Specialized layout for accommodations category.
 *
 * Features:
 * - Star ratings display
 * - Price range indicators
 * - Booking CTAs
 * - Amenities highlights
 * - Check-in/out times
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bed,
  Star,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
  Filter,
  ChevronDown,
} from "lucide-react";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { CategoryLayoutProps } from "../types";
import { getCategoryMeta } from "../../constants";
import { Accommodation } from "@/features/places/types";

type StarFilter = "all" | 1 | 2 | 3 | 4 | 5;

export default function AccommodationsCategoryLayout({
  category,
  places,
  isLoadingPlaces,
}: CategoryLayoutProps) {
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;
  const meta = getCategoryMeta(category.slug);
  const accentColor = meta?.text || "text-blue-600";
  const accentBg = meta?.bg || "bg-blue-50";

  // Cast places to accommodations and filter by stars
  const accommodations = places as Accommodation[];
  const filteredPlaces =
    starFilter === "all"
      ? accommodations
      : accommodations.filter((p) => p.stars === starFilter);

  // Count by star rating
  const starCounts = accommodations.reduce(
    (acc, p) => {
      if (p.stars) acc[p.stars] = (acc[p.stars] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24"
      data-testid="category-layout-accommodations"
    >
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden group">
        {image && (
          <img
            src={image}
            alt={category.nombre}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16">
          <Link
            to="/categorias"
            className="text-white/80 hover:text-white flex items-center gap-2 mb-6 uppercase tracking-widest text-xs font-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a categorías
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`h-14 w-14 rounded-2xl ${accentBg} flex items-center justify-center shadow-lg`}
            >
              <Bed className={`w-7 h-7 ${accentColor}`} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
              Alojamiento
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
            {category.nombre}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl font-medium leading-relaxed">
            {category.descripcion}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 md:px-16 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtrar
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setStarFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    starFilter === "all"
                      ? `${accentBg} ${accentColor}`
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Todos ({places.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) =>
                  starCounts[stars] ? (
                    <button
                      key={stars}
                      onClick={() => setStarFilter(stars as StarFilter)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        starFilter === stars
                          ? `${accentBg} ${accentColor}`
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {stars}
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-slate-400 ml-1">
                        ({starCounts[stars]})
                      </span>
                    </button>
                  ) : null,
                )}
              </div>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {filteredPlaces.length} alojamiento
              {filteredPlaces.length !== 1 && "s"}
            </div>
          </div>

          {/* Mobile filters dropdown */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setStarFilter("all");
                    setShowFilters(false);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    starFilter === "all"
                      ? `${accentBg} ${accentColor}`
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Todos
                </button>
                {[5, 4, 3, 2, 1].map((stars) =>
                  starCounts[stars] ? (
                    <button
                      key={stars}
                      onClick={() => {
                        setStarFilter(stars as StarFilter);
                        setShowFilters(false);
                      }}
                      className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold ${
                        starFilter === stars
                          ? `${accentBg} ${accentColor}`
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {stars} <Star className="w-3 h-3 fill-amber-400" />
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accommodations Grid */}
      <div className="container mx-auto px-6 md:px-16 py-12">
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="relative">
                <PlaceCard place={place} />
                {/* Star overlay */}
                {(place as Accommodation).stars && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                    {Array.from({
                      length: (place as Accommodation).stars || 0,
                    }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Bed className="w-16 h-16 mx-auto text-slate-300 mb-6" />
            <p className="text-xl font-bold text-slate-400">
              {starFilter !== "all"
                ? `No hay alojamientos de ${starFilter} estrellas.`
                : "No hay alojamientos disponibles."}
            </p>
            {starFilter !== "all" && (
              <button
                onClick={() => setStarFilter("all")}
                className={`mt-6 px-6 py-3 rounded-full ${accentBg} ${accentColor} font-bold text-sm`}
              >
                Ver todos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      {places.length > 0 && (
        <div className="border-t border-slate-200 bg-white">
          <div className="container mx-auto px-6 md:px-16 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div
                className={`p-8 rounded-3xl ${accentBg} border ${meta?.border || "border-blue-100"}`}
              >
                <Clock className={`w-8 h-8 ${accentColor} mb-4`} />
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Horarios típicos
                </h3>
                <p className="text-slate-600">
                  Check-in: 14:00 - 22:00
                  <br />
                  Check-out: hasta 11:00
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <MapPin className="w-8 h-8 text-slate-500 mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Ubicación
                </h3>
                <p className="text-slate-600">
                  Todos los alojamientos están situados en zonas de fácil acceso
                  con parking disponible.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <Phone className="w-8 h-8 text-slate-500 mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Reservas
                </h3>
                <p className="text-slate-600">
                  Contacta directamente con cada establecimiento para reservar o
                  usa su web de reservas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
